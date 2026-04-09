import { NextResponse } from "next/server";


const COOKIE_ACCESS_MAX_AGE = 2 * 60 * 60;

export async function POST(request: Request) {
    const body = await request.json();
    const { accessToken, refreshToken } = body;

    if (!accessToken || !refreshToken) {
        return NextResponse.json(
            { message: "Thiếu token để làm mới session" },
            { status: 400 }
        );
    }

    const response = NextResponse.json({
        message: "Refresh token thành công",
    });

    response.cookies.set("accessToken", accessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_ACCESS_MAX_AGE,
    });


    response.cookies.set("refreshToken", refreshToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
    });
    return response;
}