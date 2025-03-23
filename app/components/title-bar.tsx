import { ChevronRightIcon } from "lucide-react";
import { Outlet, useLocation, useMatches, useNavigate } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { Back, Close, Maximize, Minimize, Restore } from "~/components/icons/chrome";
import { Notifications } from "~/components/notifications";
import { ThemeToggle } from "~/components/theme-toggle";
import { cn } from "~/lib/utils";
import { useAppWindow } from "~/providers/app-window";

interface Handle {
  breadcrumb?: string;
}

export default function WindowTitleBar() {
  const { isMaximized, minimizeWindow, maximizeWindow, closeWindow } = useAppWindow();
  // const { osType } = useOSInformation();
  const osType = "windows";
  const { pathname } = useLocation();
  const matches = useMatches();
  const navigate = useNavigate();

  const breadcrumbs = matches
    .filter((match) => match.handle && (match.handle as Handle).breadcrumb)
    .map((match) => (match.handle as Handle).breadcrumb);

  const buttons: {
    key: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[] = [
    {
      key: "minimize",
      icon: <Minimize />,
      onClick: () => minimizeWindow(),
    },

    {
      key: "maximize",
      icon: isMaximized ? <Restore /> : <Maximize />,
      onClick: () => maximizeWindow(),
    },

    {
      key: "close",
      icon: <Close />,
      onClick: () => closeWindow(),
    },
  ];

  return (
    <>
      <header className="relative z-100 flex h-(--title-bar-height) w-screen" data-tauri-drag-region>
        {pathname !== "/" && osType === "windows" && <CaptionButton icon={<Back />} onClick={() => navigate("/")} />}
        <ul
          className={cn(
            "font-(family-name:--font-segoe-ui) pointer-events-none flex items-center gap-x-2 whitespace-nowrap text-base",
            {
              "-translate-1/2 absolute top-1/2 left-1/2": osType !== "windows",
              "ml-4": osType === "windows",
            },
          )}
        >
          <li className="mr-2">
            <img className="size-4" src="/app-icon.png" alt="App Icon" />
          </li>
          <li>Decent Client</li>
          {breadcrumbs.map((crumb, index) => {
            return (
              <Fragment key={crumb}>
                {index > 0 && (
                  <li className="[&>svg]:size-3.5">
                    <ChevronRightIcon className="stroke-muted-foreground" />
                  </li>
                )}
                <li key={crumb} className="text-muted-foreground">
                  {crumb}
                </li>
              </Fragment>
            );
          })}
        </ul>
        <TitleBarMenu className="ml-auto">
          <ThemeToggle />
          <Notifications />
        </TitleBarMenu>
        <CaptionControlGroup>
          {buttons.map((button) => (
            <CaptionButton key={button.key} identifier={button.key} icon={button.icon} onClick={button.onClick} />
          ))}
        </CaptionControlGroup>
      </header>
      <Outlet />
    </>
  );
}

function TitleBarMenu({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <fieldset className={cn("mr-1 flex h-(--title-bar-height) items-center gap-x-0.5", className)}>{children}</fieldset>
  );
}

function CaptionButton({
  icon,
  identifier,
  className,
  ...rest
}: { icon: React.ReactNode; identifier?: string; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-(--title-bar-height) w-[46px] cursor-default items-center justify-center transition-colors duration-100",
        "bg-caption-button hover:bg-caption-button-hover active:bg-caption-button-active",
        {
          "hover:bg-caption-button-close-hover active:bg-caption-button-close-active": identifier === "close",
        },
        className,
      )}
      {...rest}
    >
      <span className="font-[300] font-segoe-fluent-icons text-[10px] text-foreground">{icon}</span>
    </button>
  );
}

function CaptionControlGroup({ className, children }: { className?: string; children: React.ReactNode }) {
  return <fieldset className={cn("flex", className)}>{children}</fieldset>;
}
