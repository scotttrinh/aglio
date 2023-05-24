import { NextRequest, NextResponse } from "next/server";

import e from "@/dbschema/edgeql-js";
import { client } from "@/client";

interface Context {
  params: {
    id: string;
  };
}

const deleteSequence = e.params({ id: e.uuid }, (params) =>
  e.delete(e.Sequence, (sequence) => ({
    filter_single: e.op(sequence.id, "=", params.id),
  }))
);

export async function DELETE(
  request: NextRequest,
  { params }: Context
): Promise<NextResponse> {
  const id = params.id;

  try {
    const result = await deleteSequence.run(client, { id });

    if (!result) {
      return NextResponse.json(
        { message: "Sequence not found" },
        { status: 404 }
      );
    }

    return new NextResponse(undefined, { status: 203 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: `Something went wrong: ${error}` },
      { status: 500 }
    );
  }
}
