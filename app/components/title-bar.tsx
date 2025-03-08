import { type Window, getCurrentWindow } from "@tauri-apps/api/window";
import { ChevronRightIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { cn } from "~/lib/utils";
import { useBreadcrumbs } from "~/providers/breadcrumbs";

export default function WindowTitleBar() {
	const { pathname } = useLocation();
	const [currentWindow, setCurrentWindow] = useState<Window>();
	const { breadcrumbs } = useBreadcrumbs();
	const navigate = useNavigate();

	useEffect(() => {
		setCurrentWindow(getCurrentWindow());
	}, []);

	const buttons: {
		key: string;
		icon: React.ReactNode;
		close?: boolean;
		onClick?: () => void;
	}[] = [
		{
			key: "minimize",
			icon: <>&#xE921;</>,
			onClick: () => {
				currentWindow?.minimize();
			},
		},
		{
			key: "close",
			icon: <>&#xE8BB;</>,
			onClick: () => {
				currentWindow?.close();
			},
			close: true,
		},
	];

	return (
		<>
			<header
				className={cn("fixed inset-x-0 top-0 z-50 flex h-[32px] select-none")}
				data-tauri-drag-region
			>
				{pathname !== "/" && (
					<CaptionButton icon={<>&#xE72B;</>} onClick={() => navigate("/")} />
				)}
				<ol className="pointer-events-none ml-4 flex items-center whitespace-nowrap font-segeo-ui text-base">
					<li>
						<img
							className="pointer-events-none my-2 size-4"
							src="/app-icon.png"
							alt="Icon"
						/>
					</li>
					<li className="ml-4">Decent Client</li>
					{breadcrumbs.map((crumb, index) => (
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
					))}
				</ol>
				<CaptionControlGroup className="ml-auto">
					{buttons.map((button) => (
						<CaptionButton
							key={button.key}
							icon={button.icon}
							isClose={button.close}
							onClick={button.onClick}
						/>
					))}
				</CaptionControlGroup>
			</header>
			<Outlet />
		</>
	);
}

function CaptionButton(
	props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
		icon: React.ReactNode;
		className?: string;
		isClose?: boolean;
	},
) {
	return (
		<button
			type="button"
			className={cn(
				"flex h-[32px] w-[46px] cursor-default items-center justify-center transition-colors duration-100",
				"hover:bg-[rgba(255,255,255,0.0605)] active:bg-[rgba(255,255,255,0.0419)] disabled:text-[rgba(255,255,255,0.3628)] disabled:hover:bg-transparent",
				{
					"hover:bg-[rgb(196_43_28)] active:bg-[rgb(196_42_28/0.9)]":
						props.isClose,
				},
				props.className,
			)}
			{...props}
		>
			<span className="font-[300] font-segoe-fluent-icons text-[10px] text-foreground">
				{props.icon}
			</span>
		</button>
	);
}

function CaptionControlGroup({
	className,
	children,
}: { className?: string; children: React.ReactNode }) {
	return <fieldset className={cn("flex", className)}>{children}</fieldset>;
}
