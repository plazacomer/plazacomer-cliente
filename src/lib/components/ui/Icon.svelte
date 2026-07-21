<script lang="ts">
	import {
		Home, Search, ShoppingCart, MessageCircle, User, Bell, Heart, Plus, Minus, X,
		ArrowLeft, ArrowRight, Check, Star, Clock, Moon, Sun, MapPin, Store, Filter,
		MessageSquare, Share2, Sparkles, Flame, Play, LogOut, ChevronDown, Trash2, Edit,
		Send, Tag, CreditCard, Coins, AlertTriangle, Package, Truck, Map, Shield, Phone,
		Timer, Box, Camera, Users, Receipt, Calendar, ArrowUp, ArrowDown,
		type Icon as LucideIcon,
	} from 'lucide-svelte';

	type Props = {
		name: string;
		size?: number;
		color?: string;
		strokeWidth?: number;
		class?: string;
	};
	let { name, size = 20, color = 'currentColor', strokeWidth = 2, class: cls = '' }: Props = $props();

	// Mapea los nombres que ya usa el resto de la app a los íconos oficiales de
	// lucide-svelte (https://lucide.dev/icons/) — así ningún componente que ya
	// usa <Icon name="..."> necesita cambiar.
	const ICONS: Record<string, typeof LucideIcon> = {
		home: Home, search: Search, cart: ShoppingCart, message: MessageCircle, user: User,
		bell: Bell, heart: Heart, heartFill: Heart, plus: Plus, minus: Minus, close: X,
		arrowLeft: ArrowLeft, arrowRight: ArrowRight, check: Check, star: Star, starFill: Star,
		clock: Clock, moon: Moon, sun: Sun, location: MapPin, store: Store, filter: Filter,
		chat: MessageSquare, share: Share2, sparkle: Sparkles, fire: Flame, play: Play,
		logout: LogOut, chevronDown: ChevronDown, trash: Trash2, edit: Edit, send: Send,
		tag: Tag, credit: CreditCard, coin: Coins, alert: AlertTriangle, package: Package,
		truck: Truck, map: Map, shield: Shield, phone: Phone, timer: Timer, box: Box,
		camera: Camera, users: Users, receipt: Receipt, calendar: Calendar,
		arrowUp: ArrowUp, arrowDown: ArrowDown,
	};

	const Cmp = $derived(ICONS[name] ?? Home);
	const filled = $derived(name === 'heartFill' || name === 'starFill');
</script>

<Cmp {size} {color} {strokeWidth} class={cls} fill={filled ? color : 'none'}/>
