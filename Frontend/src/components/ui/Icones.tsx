import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  Heart,
  Home,
  Info,
  LayoutGrid,
  Lock,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Paintbrush,
  Pencil,
  Play,
  Search,
  Send,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  User,
  X,
} from 'lucide-react'

type Props = { tamanho?: number }

const padrao = { strokeWidth: 2, 'aria-hidden': true, focusable: false } as const

export function IconeBusca({ tamanho = 18 }: Props) {
  return <Search size={tamanho} {...padrao} />
}

export function IconeUsuario({ tamanho = 18 }: Props) {
  return <User size={tamanho} {...padrao} />
}

export function IconeSacola({ tamanho = 18 }: Props) {
  return <ShoppingBag size={tamanho} {...padrao} />
}

export function IconeCheck({ tamanho = 16 }: Props) {
  return <Check size={tamanho} {...padrao} />
}

export function IconeCaminhao({ tamanho = 16 }: Props) {
  return <Truck size={tamanho} {...padrao} />
}

export function IconePacote({ tamanho = 18 }: Props) {
  return <Package size={tamanho} {...padrao} />
}

export function IconePincel({ tamanho = 18 }: Props) {
  return <Paintbrush size={tamanho} {...padrao} />
}

export function IconeEditar({ tamanho = 16 }: Props) {
  return <Pencil size={tamanho} {...padrao} />
}

export function IconeLixeira({ tamanho = 16 }: Props) {
  return <Trash2 size={tamanho} {...padrao} />
}

export function IconeMenu({ tamanho = 20 }: Props) {
  return <Menu size={tamanho} {...padrao} />
}

export function IconeFechar({ tamanho = 20 }: Props) {
  return <X size={tamanho} {...padrao} />
}

export function IconeConversa({ tamanho = 18 }: Props) {
  return <MessageSquare size={tamanho} {...padrao} />
}

export function IconeGrafico({ tamanho = 18 }: Props) {
  return <TrendingUp size={tamanho} {...padrao} />
}

export function IconeEngrenagem({ tamanho = 18 }: Props) {
  return <Settings size={tamanho} {...padrao} />
}

export function IconeEnviar({ tamanho = 18 }: Props) {
  return <Send size={tamanho} {...padrao} />
}

export function IconeMapa({ tamanho = 18 }: Props) {
  return <MapPin size={tamanho} {...padrao} />
}

export function IconeSelo({ tamanho = 18 }: Props) {
  return <Award size={tamanho} {...padrao} />
}

export function IconeAviso({ tamanho = 18 }: Props) {
  return <AlertTriangle size={tamanho} {...padrao} />
}

export function IconeInfo({ tamanho = 18 }: Props) {
  return <Info size={tamanho} {...padrao} />
}

export function IconeEtiqueta({ tamanho = 18 }: Props) {
  return <Tag size={tamanho} {...padrao} />
}

export function IconeFiltro({ tamanho = 18 }: Props) {
  return <SlidersHorizontal size={tamanho} {...padrao} />
}

export function IconeSetaBaixo({ tamanho = 16 }: Props) {
  return <ChevronDown size={tamanho} {...padrao} />
}

export function IconeEstrela({ tamanho = 16, preenchida = true }: Props & { preenchida?: boolean }) {
  return <Star size={tamanho} fill={preenchida ? 'currentColor' : 'none'} {...padrao} />
}

export function IconeCoracao({ tamanho = 18, preenchido = false }: Props & { preenchido?: boolean }) {
  return <Heart size={tamanho} fill={preenchido ? 'currentColor' : 'none'} {...padrao} />
}

export function IconeCadeado({ tamanho = 18 }: Props) {
  return <Lock size={tamanho} {...padrao} />
}

export function IconePlay({ tamanho = 18 }: Props) {
  return <Play size={tamanho} {...padrao} />
}

export function IconeGrade({ tamanho = 18 }: Props) {
  return <LayoutGrid size={tamanho} {...padrao} />
}

export function IconeMarcador({ tamanho = 18, preenchido = false }: Props & { preenchido?: boolean }) {
  return <Bookmark size={tamanho} fill={preenchido ? 'currentColor' : 'none'} {...padrao} />
}

export function IconeSetaDireita({ tamanho = 16 }: Props) {
  return <ArrowRight size={tamanho} {...padrao} />
}

export function IconeSetaEsquerda({ tamanho = 16 }: Props) {
  return <ArrowLeft size={tamanho} {...padrao} />
}

export function IconeSair({ tamanho = 18 }: Props) {
  return <LogOut size={tamanho} {...padrao} />
}

export function IconeCasa({ tamanho = 18 }: Props) {
  return <Home size={tamanho} {...padrao} />
}

export function IconeCalendario({ tamanho = 18 }: Props) {
  return <CalendarDays size={tamanho} {...padrao} />
}
