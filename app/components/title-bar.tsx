import { ChevronRightIcon } from "lucide-react";
import { Outlet, useLocation, useMatches, useNavigate } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { TitleBarMenu } from "~/components/title-bar-menu";
import { cn } from "~/lib/utils";
import { useAppWindow } from "~/providers/app-window";

interface Handle {
  breadcrumb?: string;
}

export default function WindowTitleBar() {
  const { isMaximized, minimizeWindow, maximizeWindow, closeWindow } = useAppWindow();
  const { pathname } = useLocation();
  const matches = useMatches();
  const navigate = useNavigate();

  const breadcrumbs = matches
    .filter((match) => match.handle && (match.handle as Handle).breadcrumb)
    .map((match) => (match.handle as Handle).breadcrumb);

  console.log(breadcrumbs);

  const buttons: {
    key: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[] = [
    {
      key: "minimize",
      icon: <>&#xE921;</>,
      onClick: () => minimizeWindow(),
    },

    {
      key: "maximize",
      icon: isMaximized ? <>&#xE923;</> : <>&#xE922;</>,
      onClick: () => maximizeWindow(),
    },

    {
      key: "close",
      icon: <>&#xE8BB;</>,
      onClick: () => closeWindow(),
    },
  ];

  return (
    <>
      <header className={cn("fixed inset-x-0 top-0 z-50 flex h-[32px] select-none")} data-tauri-drag-region>
        {pathname !== "/" && <CaptionButton icon={<>&#xE72B;</>} onClick={() => navigate("/")} />}
        <ol className="pointer-events-none ml-4 flex items-center whitespace-nowrap font-segeo-ui text-base">
          <li>
            <img className="pointer-events-none my-2 size-4" src="/app-icon.png" alt="Icon" />
          </li>
          <li className="ml-4">Decent Client</li>
          {breadcrumbs.map((crumb, index) => {
            return (
              <Fragment key={crumb}>
                {index > 0 && (
                  <li className="ml-2 [&>svg]:size-3.5">
                    <ChevronRightIcon className="stroke-muted-foreground" />
                  </li>
                )}
                <li key={crumb} className="ml-2 text-muted-foreground">
                  {crumb}
                </li>
              </Fragment>
            );
          })}
        </ol>
        <TitleBarMenu className="ml-auto" />
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

function CaptionButton(
  props: {
    icon: React.ReactNode;
    identifier?: string;
    className?: string;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const { identifier, icon, className, ...restProps } = props;

  return (
    <button
      type="button"
      className={cn(
        "flex h-[32px] w-[46px] cursor-default items-center justify-center transition-colors duration-100",
        "hover:bg-[rgba(255,255,255,0.0605)] active:bg-[rgba(255,255,255,0.0419)] disabled:text-[rgba(255,255,255,0.3628)] disabled:hover:bg-transparent",
        {
          "hover:bg-[rgb(196_43_28)] active:bg-[rgb(196_42_28/0.9)]": identifier === "close",
        },
        className,
      )}
      {...restProps}
    >
      <span className="font-[300] font-segoe-fluent-icons text-[10px] text-foreground">{icon}</span>
    </button>
  );
}

function CaptionControlGroup({ className, children }: { className?: string; children: React.ReactNode }) {
  return <fieldset className={cn("flex", className)}>{children}</fieldset>;
}
