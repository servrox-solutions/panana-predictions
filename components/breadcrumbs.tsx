import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbsProps {
  className: string;
  linkHref: string;
  linkTitle: string;
  pageName: string;
  [x: string]: any;
}

export function Breadcrumbs({
  className,
  linkHref,
  linkTitle,
  pageName,
  ...props
}: BreadcrumbsProps) {
  return (
    <Breadcrumb className={className} {...props}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={linkHref}>{linkTitle}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{pageName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
