import { ChevronRight } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { Link, useLocation, useNavigate } from "react-router";
import { Back, Close, Maximize, Minimize, Restore } from "~/components/icons/caption-buttons";
import { ThemeToggle } from "~/components/theme-toggle";
import { useBreadcrumbs } from "~/hooks/matches/breadcrumbs";
import { cn } from "~/lib/utils";
import { useAppWindow } from "~/providers/app-window";

type CaptionButton = {
  key?: string;
  icon: React.ReactNode;
  onClick: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function WindowTitleBar() {
  const { minimizeWindow, maximizeWindow, closeWindow, isMaximized } = useAppWindow();
  const breadcrumbs = useBreadcrumbs();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const buttons: CaptionButton[] = [
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
      className: "hover:bg-caption-button-close-hover active:bg-caption-button-close-active",
      onClick: () => closeWindow(),
    },
  ];

  return (
    <header className="relative flex h-(--title-bar-height) w-screen" data-tauri-drag-region>
      {pathname !== "/" && <CaptionButton icon={<Back />} onClick={() => navigate("/")} />}
      <div className="pointer-events-none flex flex-1 items-center">
        <ul className="ml-4 flex items-center gap-x-2 whitespace-nowrap font-segoe-ui text-base">
          <li className="mr-2">
            <img className="size-4" src="/app-icon.png" alt="App Icon" />
          </li>
          <li>
            <Link to="/">Decent Client</Link>
          </li>
          {breadcrumbs.map((crumb, index) => {
            return (
              <Fragment key={crumb}>
                {index > 0 && (
                  <li>
                    <ChevronRight className="size-3.5 stroke-muted-foreground" />
                  </li>
                )}
                <li key={crumb} className="text-muted-foreground">
                  {crumb}
                </li>
              </Fragment>
            );
          })}
        </ul>
      </div>
      <fieldset className="mr-1 flex h-(--title-bar-height) items-center gap-x-0.5">
        <ThemeToggle />
      </fieldset>
      <CaptionControlGroup>
        {buttons.map((button) => (
          <CaptionButton {...button} key={button.key} />
        ))}
      </CaptionControlGroup>
    </header>
  );
}

function CaptionButton({ icon, className, onClick, ...rest }: CaptionButton) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-(--title-bar-button-height) w-(--title-bar-button-width) items-center justify-center bg-caption-button transition-colors duration-100 hover:bg-caption-button-hover active:bg-caption-button-active",
        className,
      )}
      onClick={onClick}
      {...rest}
    >
      {icon}
    </button>
  );
}

function CaptionControlGroup({ children }: { children: React.ReactNode }) {
  return <fieldset className="flex">{children}</fieldset>;
}
