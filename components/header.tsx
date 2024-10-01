import { ModeToggle } from "./mode-toggle";
import { WalletSelector } from "./wallet-selector";
import { Logo } from "./sidenav/logo";
import { FundWalletButton } from './fund-wallet-button';

export function Header() {
  return (
    <header className="flex w-full items-center gap-4 backdrop-blur-lg px-3 py-3 border-b border-gray-200 dark:border-gray-600 sm:border-0 dark:bg-gray-700/30 bg-white/30 sm:bg-transparent sm:dark:bg-transparent">
      <link
        rel="icon"
        // href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><style>text { filter: invert(1) grayscale(100%); } @media (prefers-color-scheme: dark) { text { filter: invert(0) grayscale(100%); } }</style><text y=%22.9em%22 font-size=%2290%22>🍌</text></svg>"
        // href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍌</text></svg>"
        href="/favicon.png"
      />
      {/* <EmojiCanvas /> */}
      {/* <SidenavMobile /> */}
      {/* <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="#">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="#">Orders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Recent Orders</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}
      <div className="block sm:hidden">
        <Logo />
      </div>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        /> */}
      </div>

      <ModeToggle className="hidden sm:flex" />
      <FundWalletButton />
      {/* <WalletReconnect className="hidden sm:flex" /> */}
      <WalletSelector />
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
             <Image
              src="/placeholder-user.jpg"
              width={36}
              height={36}
              alt="Avatar"
              className="overflow-hidden rounded-full"
            /> 
            <User className="h-5 w-5 transition-all group-hover:scale-110" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
    </header>
  );
}
