
import { NextResponse } from 'next/server';
import { isLoggedIn } from '@/lib/auth';
import { db } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const allowed = [
  'colonies',
  'eggProductions',
  'expenses',
  'cycles',
  'feeders',
  'feederSchedules',
  'feederLogs',
  'settings',
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  if (!await isLoggedIn()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { collection } = await params;

  if (!allowed.includes(collection)) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  const database = await db();
  const rows = await database
    .collection(collection)
    .find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();

  return NextResponse.json(
    rows.map((x) => ({ ...x, _id: String(x._id) }))
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  if (!await isLoggedIn()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { collection } = await params;

  if (!allowed.includes(collection)) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const database = await db();

    // Produksi dan pengeluaran wajib terhubung ke siklus aktif
    if (['eggProductions', 'expenses'].includes(collection)) {
      const activeCycle = await database
        .collection('cycles')
        .findOne({ status: 'active' });

      if (!activeCycle) {
        return NextResponse.json(
          { error: 'Belum ada siklus aktif. Mulai siklus terlebih dahulu.' },
          { status: 400 }
        );
      }

      body.cycleId = String(activeCycle._id);
      body.cycleName = activeCycle.name;
    }

    // Validasi dan normalisasi data koloni
    if (collection === 'colonies') {
      body.active = true;
      body.males = Number(body.males || 0);
      body.females = Number(body.females || 0);

      if (
        !body.name ||
        body.males < 0 ||
        body.females < 0
      ) {
        return NextResponse.json(
          { error: 'Data koloni tidak valid' },
          { status: 400 }
        );
      }
    }

    // Validasi produksi telur
    if (collection === 'eggProductions') {
      body.count = Number(body.count);

      if (
        !body.date ||
        !body.colonyName ||
        !Number.isFinite(body.count) ||
        body.count < 0
      ) {
        return NextResponse.json(
          { error: 'Data produksi tidak valid' },
          { status: 400 }
        );
      }
    }

    // Validasi pengeluaran
    if (collection === 'expenses') {
      body.amount = Number(body.amount);

      if (
        !body.date ||
        !body.description ||
        !Number.isFinite(body.amount) ||
        body.amount <= 0
      ) {
        return NextResponse.json(
          { error: 'Data pengeluaran tidak valid' },
          { status: 400 }
        );
      }
    }

    body.createdAt = new Date();

    const result = await database.collection(collection).insertOne(body);

    return NextResponse.json({
      ok: true,
      id: String(result.insertedId),
    });
  } catch {
    return NextResponse.json(
      { error: 'Data tidak valid' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  if (!await isLoggedIn()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { collection } = await params;

  if (!allowed.includes(collection)) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  try {
    const { _id } = await req.json();
    const database = await db();

    await database.collection(collection).deleteOne({
      _id: new ObjectId(_id),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'ID tidak valid' },
      { status: 400 }
    );
  }
}
