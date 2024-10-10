import { NextRequest, NextResponse } from "next/server";
import { validate, parse, InitData } from "@telegram-apps/init-data-node";
import { storeTelegramUser } from "@/lib/supabase/store-telegram-user";
import { User } from "grammy/types";

async function authorizeRequest(
  req: NextRequest
): Promise<InitData | undefined> {
  const authHeader = req.headers.get("authorization") || "";
  const [authType, authData = ""] = authHeader.split(" ");

  if (authType !== "tma") {
    throw new Error("Unauthorized");
  }

  validate(authData, process.env.TELEGRAM_BOT_TOKEN!, {
    expiresIn: 3600,
  });

  const initData = parse(authData);

  if (initData.user) {
    const user: User = {
      id: initData.user.id,
      first_name: initData.user.firstName,
      last_name: initData.user.lastName,
      username: initData.user.username,
      is_premium: initData.user.isPremium || undefined,
      language_code: initData.user.languageCode,
      is_bot: !!initData.user.isBot,
    };

    storeTelegramUser(user).then((result) => {
      if (result.success) {
        console.log("user saved", result.data);
      } else {
        console.error("error on saving user", result.error);
      }
    });
  }

  return initData;
}

export async function POST(req: NextRequest) {
  try {
    const initData = await authorizeRequest(req);

    if (!initData) {
      return NextResponse.json(
        { error: "Init data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(initData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
