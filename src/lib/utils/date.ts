import { format, formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export function formatRelativeDate(iso: string): string {
  return formatDistanceToNow(new Date(iso), {
    addSuffix: true,
    locale: zhCN,
  });
}

export function formatFullDate(iso: string): string {
  return format(new Date(iso), "yyyy年M月d日 HH:mm", { locale: zhCN });
}
