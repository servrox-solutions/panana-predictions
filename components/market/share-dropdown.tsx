import { Share2 } from "lucide-react";
import { useMemo } from "react";
import {
  TwitterShareButton,
  TelegramShareButton,
  TelegramIcon,
  FacebookShareButton,
  WhatsappShareButton,
  WhatsappIcon,
  EmailShareButton,
  EmailIcon,
  HatenaShareButton,
  HatenaIcon,
  TwitterIcon,
  FacebookIcon,
} from "react-share";
import { SimpleContainerDropdown } from "../simple-container-dropdown";
import { Button } from "../ui/button";

export interface ShareDropdownProps {
  address: string;
}

export const ShareDropdown = ({ address }: ShareDropdownProps) => {
  const getSocialMessage = (marketId: string) =>
    `📈 Think you can predict the next move in crypto?\nJoin our latest market and put your forecast to the test!\n\nhttps://app.panana-predictions.xyz/markets/${marketId}\n\nOnly on 🍌Panana Predictions!`;

  const shareElements = useMemo(
    () => [
      <TwitterShareButton className="w-8 h-8" url={getSocialMessage(address)}>
        <TwitterIcon className="w-8 h-8 rounded-full" />
      </TwitterShareButton>,
      <TelegramShareButton className="w-8 h-8" url={getSocialMessage(address)}>
        <TelegramIcon className="w-8 h-8 rounded-full" />
      </TelegramShareButton>,
      <FacebookShareButton className="w-8 h-8" url={getSocialMessage(address)}>
        <FacebookIcon className="w-8 h-8 rounded-full" />
      </FacebookShareButton>,
      <WhatsappShareButton className="w-8 h-8" url={getSocialMessage(address)}>
        <WhatsappIcon className="w-8 h-8 rounded-full" />
      </WhatsappShareButton>,
      <EmailShareButton className="w-8 h-8" url={getSocialMessage(address)}>
        <EmailIcon className="w-8 h-8 rounded-full" />
      </EmailShareButton>,
      <HatenaShareButton className="w-8 h-8" url={getSocialMessage(address)}>
        <HatenaIcon className="w-8 h-8 rounded-full" />
      </HatenaShareButton>,
    ],
    [address, getSocialMessage]
  );

  return (
    <SimpleContainerDropdown
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary hover:bg-primary/20"
          disabled={shareElements.length === 0}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      }
      buttons={shareElements}
    />
  );
};
