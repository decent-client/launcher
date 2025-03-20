import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "~/providers/theme";

export function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme();

  return <Sonner theme={theme as ToasterProps["theme"]} {...props} />;
}
