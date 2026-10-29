# Autenticação real — execução local e limites

Cadastro, login/alias, logout e consulta de sessão usam **Next → api-gateway → profile-service → PostgreSQL**. `POST /api/v1/auth/{cadastro,login,entrar,logout}` e `GET /api/v1/usuario` nunca usam a Fake API nem fazem fallback para ela quando o gateway falha. `API_GATEWAY_URL` e `API_URL` são configurações distintas, somente do servidor, lidas em runtime.

O navegador usa a mesma origem do Next, `credentials: 'same-origin'` e cookie `balaio_sessao` HttpOnly, SameSite=Lax, Path=/api/v1, 60 minutos. O backend determina Secure; só o perfil local HTTP pode desativá-lo. Nenhum JWT é lido pelo JavaScript, enviado à Fake API ou salvo em localStorage/sessionStorage. O proxy preserva Origin, Bearer e Set-Cookie somente no fluxo real e descarta headers de identidade enviados pelo cliente.

## Preparação

### Docker já preparado nesta máquina

O frontend, gateway, profile, catálogo e seus dois bancos usam o projeto Docker `balaio-local`. Acesse **http://localhost:4321/login/register** para cadastrar sua conta real. Os itens de Minha conta foram restaurados com dados Fake isolados por conta, sem modo demo nem avisos de integração.

Para iniciar novamente, na pasta `platform`:

```powershell
docker compose --profile extended -f docker-compose.yml -f docker-compose.auth-local.yml up -d --wait frontend profile-service
```

Para reconstruir após novas alterações, acrescente `--build` ao `up`. O override é exclusivo de desenvolvimento HTTP local e configura as origens da porta do frontend, cookie local e chaves RSA montadas somente para os consumidores corretos. As chaves e o arquivo `docker-admin.env` ficam em `%USERPROFILE%/.balaio-local/chaves`, fora do Git. Não apague ou regenere as chaves a cada inicialização. Um diretório diferente pode ser informado por `BALAIO_AUTH_DIR`.

Volumes existentes dos bancos foram preservados. Os builds do gateway/profile compilam as fontes atuais com Java 25 dentro do Docker, sem depender do JAR antigo do host. Os containers permanecem em execução para o teste manual.

### Alternativa: Java e Next no host

Use Node 22 ou superior, npm, JDK 25 e Docker Desktop ativo. Não é necessário subir os demais microsserviços para autenticação. O Compose base não fornece as variáveis RSA; o override acima as adiciona. Os comandos seguintes são uma alternativa que usa apenas o banco no Docker e inicia Java/Next localmente. Não inicie essa alternativa nas mesmas portas enquanto os containers estiverem em execução.

Na pasta `Balaio/Frontend`, configure `.env.local` a partir de `.env.example`, preservando um arquivo existente:

```powershell
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm ci
docker compose -f ../../platform/docker-compose.yml --profile extended up -d profile-db
```

As configurações do frontend são:

```dotenv
API_URL=http://127.0.0.1:3001/api/v1
API_GATEWAY_URL=http://127.0.0.1:8080/api/v1
FAKE_API_PORT=3001
AUTH_ALLOWED_ORIGINS=http://localhost:4321,http://127.0.0.1:4321
```

`npm run dev` carrega `.env.local` e inicia Next/Fake com uma chave interna aleatória em memória (`BALAIO_FAKE_INTERNAL_KEY`); o launcher de produção do Docker faz o mesmo. Reinicie-os após mudar configurações. Se iniciar Next e Fake separadamente, forneça a mesma chave aleatória de pelo menos 32 caracteres em ambos, sem registrá-la no repositório ou expô-la ao navegador. Em container, `API_GATEWAY_URL` precisa do host interno do gateway, por exemplo `http://api-gateway:8080/api/v1`; localhost do container não é o host. A configuração antiga `FAKE_API_DEMO_ENABLED` não habilita mais nenhuma funcionalidade.

## Chaves locais

Gere uma vez por ambiente, fora do repositório; preserve as chaves em reinícios. No PowerShell 7, este exemplo usa somente a API de criptografia do .NET, sem imprimir chave:

```powershell
$pastaChaves = Join-Path $env:USERPROFILE '.balaio-local/chaves'
$privada = Join-Path $pastaChaves 'private.pem'
$publica = Join-Path $pastaChaves 'public.pem'
if (!(Test-Path $privada) -and !(Test-Path $publica)) {
  New-Item -ItemType Directory -Path $pastaChaves -Force | Out-Null
  $rsaBalaio = [System.Security.Cryptography.RSA]::Create(3072)
  [System.IO.File]::WriteAllText($privada, $rsaBalaio.ExportPkcs8PrivateKeyPem())
  [System.IO.File]::WriteAllText($publica, $rsaBalaio.ExportSubjectPublicKeyInfoPem())
  $rsaBalaio.Dispose()
} elseif (!(Test-Path $privada) -or !(Test-Path $publica)) {
  throw 'Par incompleto. Recupere as chaves do ambiente antes de iniciar.'
}
```

Restrinja a leitura da privada à conta que executa o profile. Somente o profile recebe seu caminho. Os [READMEs do profile](../../../profile-service/README.md) e [gateway](../../../api-gateway/README.md) descrevem formato, validação e alternativa com OpenSSL. Não use as chaves dos testes como configuração de ambiente.

## Iniciar os serviços

Em um terminal **na pasta `profile-service`**, com JDK 25 selecionado em JAVA_HOME/PATH:

```powershell
$env:SPRING_DATASOURCE_URL = 'jdbc:postgresql://localhost:5434/balaio_profile'
$env:SPRING_DATASOURCE_USERNAME = 'balaio_profile_app'
$env:SPRING_DATASOURCE_PASSWORD = 'balaio'
$env:JWT_PRIVATE_KEY_LOCATION = Join-Path $env:USERPROFILE '.balaio-local/chaves/private.pem'
$env:JWT_ISSUER = 'https://balaio.local'
$env:JWT_AUDIENCE = 'balaio-api'
$env:AUTH_ALLOWED_ORIGINS = 'http://localhost:4321,http://127.0.0.1:4321'
$env:SPRING_PROFILES_ACTIVE = 'local'
$env:AUTH_COOKIE_SECURE = 'false'
$env:ADMIN_EMAIL = 'admin-local@balaio.invalid'
$senhaInicialLocal = Read-Host 'Senha inicial do administrador local (mínimo 12 caracteres)' -AsSecureString
$env:ADMIN_SENHA_INICIAL = [System.Net.NetworkCredential]::new('', $senhaInicialLocal).Password
.\mvnw.cmd -B -ntp spring-boot:run
```

`balaio` é a senha **padrão de desenvolvimento do Compose**, não uma credencial de produção; ajuste banco/porta/senha se já configurou `PROFILE_DB_PASSWORD`, `DB_PASSWORD` ou `PROFILE_DB_HOST_PORT`. O bootstrap não redefine um administrador existente. Esse administrador continua sujeito à troca obrigatória e aos limites administrativos descritos no profile.

Em outro terminal **na pasta `api-gateway`**, com JDK 25:

```powershell
$env:JWT_PUBLIC_KEY_LOCATION = Join-Path $env:USERPROFILE '.balaio-local/chaves/public.pem'
$env:JWT_ISSUER = 'https://balaio.local'
$env:JWT_AUDIENCE = 'balaio-api'
$env:AUTH_ALLOWED_ORIGINS = 'http://localhost:4321,http://127.0.0.1:4321'
$env:PROFILE_SERVICE_URL = 'http://localhost:8082'
.\mvnw.cmd -B -ntp spring-boot:run
```

Em outro terminal **na pasta `Balaio/Frontend`**:

```powershell
npm run dev
```

Abra **http://localhost:4321/login/register**. Crie comprador ou artesão com senha de pelo menos 12 caracteres Unicode, até 72 bytes UTF-8, sem caracteres de controle. Não use as credenciais da Fake API para tentar entrar na conta real. Para build/execução de produção local: `npm run build` e `npm run start`, mantendo a Fake API em processo separado (`npm run api`). Use Secure em qualquer ambiente HTTPS.

## Conferência manual

1. Cadastre uma conta e confirme `/account`. No Network, verifique o envelope público e Set-Cookie; não há JWT no JSON.
2. Recarregue `/account`: o provider consulta `GET /api/v1/usuario` e recupera a identidade persistida. O JWT tem Path=/api/v1 e não chega ao SSR das páginas.
3. Em Minha conta, use Meus pedidos, Endereços de entrega e Meus dados. Salve um endereço e contatos e recarregue: persistem no Fake para o mesmo UUID. Outra conta não recebe esses dados. A lista de pedidos começa vazia se não houver pedidos daquele UUID; fixtures globais não são apropriadas. Alterar senha continua apontando à recuperação Fake, sem alterar a senha real. `401` do gateway invalida a sessão; `403` informa falta de permissão.
4. Clique em sair e tente `/account` novamente: será exigido login. Se logout falhar, a tela limpa o estado e oferece nova tentativa, sem afirmar que removeu o cookie. Um JWT copiado continua válido até expirar; não há refresh/revogação imediata.
5. Navegue pelo catálogo, sacola e favoritos: os dados públicos e o estado de visitante continuam disponíveis. Checkout, publicação e painéis ainda não integrados seguem bloqueados e suas páginas redirecionam para a conta, sem avisos novos.
6. Pare somente o gateway/profile e tente login com a Fake API ainda ativa: a resposta deve ser indisponibilidade, sem autenticar pelo simulador.

A interface revalida ao montar, voltar à aba/foco e a cada 30 segundos enquanto visível. A expiração é aplicada no backend; a tela ociosa visível reage na próxima revalidação. Ao voltar de uma aba em segundo plano, ocorre nova consulta. Não há temporizador inferido por decodificação do cookie HttpOnly.

## Itens da conta na Fake API

Não existe conta demo, seletor de fixture, provider de demonstração ou tradução de cookie para autenticar a Fake API. As antigas rotas `/api/v1/demo/*` retornam 404. O cookie legado `balaio_demo_sessao` é apenas expirado, nunca emitido nem encaminhado.

`GET /usuario` permanece real para restaurar a sessão. `GET /conta/perfil` consulta o perfil Fake; `PATCH /usuario` salva somente esse perfil. CRUD de `/usuario/enderecos` e GET `/pedidos` ou `/pedidos/:id` também usam o Fake após o proxy confirmar a identidade por GET usuário no gateway. O contexto interno assinado HMAC contém somente UUID, nome/e-mail inicial, papel confiável, método, destino e expiração máxima de 30 segundos. A chave fica nos dois processos do servidor. O Fake persiste `perfisExternos` por UUID sem senha, hash ou sessão; nome/e-mail editados no Fake não substituem a identidade usada no login/header real. Não se vinculam fixtures por nome ou e-mail. Senhas, JWT e cookies de autenticação nunca são encaminhados ao Fake.

Mutações por cookie validam Origin contra `AUTH_ALLOWED_ORIGINS`; Origin ausente é rejeitado. Bearer sem cookie pode operar sem Origin após validação no gateway. Payloads de papel/UUID/senha são rejeitados antes de chegar ao Fake. Sem chave interna válida, a ponte falha fechada. A recuperação de senha continua sendo uma simulação de solicitação, sem mudança na credencial real.

Conversas e ações de pedidos, checkout, publicação de peças/vídeos e painéis permanecem bloqueados no proxy: 404 com envelope padrão. Suas páginas redirecionam silenciosamente para `/account`, sem placeholders ou avisos de integração. O catálogo público, eventos públicos, perguntas já publicadas, comentários públicos e estado de visitante permanecem simulados; somente `balaio_cliente` vai ao Fake nas rotas públicas de visitante. Coleções internas e expansões json-server continuam bloqueadas.

## Testes

- `npm run test:auth`: proxy HTTP com dois destinos controlados, cookies, isolamento de credenciais, Origin, negativas de autorização e compatibilidade.
- `npm run test:api`: suíte existente da Fake API com banco temporário.
- `npm run test:e2e:auth`: Chrome headless instalado, portas 14321/18080/13001 livres; sobe Next, gateway **controlado de teste** e Fake API com banco temporário. Verifica cookies, reload, 401/403, expiração, logout, itens da conta, persistência e isolamento de dados Fake, ausência de modo demo/avisos e bloqueio dos demais privados. O processo não usa o banco do projeto.
- `npm run lint` e `npm run build`: verificações do frontend. O build precisa acessar Google Fonts ou usar o cache já baixado.

Os testes Java reais do novo `GET /usuario` usam JDK 25/PostgreSQL via Testcontainers e estão registrados no [acompanhamento](../../../profile-service/docs/engineering/auth-jwt-progress.md). Nenhuma chave privada estática ou JWT de ambiente foi versionado.
