import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from '@/lib/utils';

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
    <Breadcrumb className={cn('text-wrap break-all', className)} {...props}>
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
