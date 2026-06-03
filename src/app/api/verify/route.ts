import { NextRequest, NextResponse } from 'next/server';

const POST = (req: NextRequest) => {
    const token = Date.now();
    const response = NextResponse.json({});
    const protocol = req.headers.get('x-forwarded-proto') ?? 'http';

    response.cookies.set('token', `${token}`, {
        httpOnly: true,
        secure: protocol === 'https',
        maxAge: 300,
        path: '/',
        sameSite: 'lax'
    });
    return response;
};
export { POST };
