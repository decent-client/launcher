type Breadcrumb = string | string[] | ((params: Record<string, string>) => string | string[]);

export type Handle = {
  breadcrumb?: Breadcrumb;
};
