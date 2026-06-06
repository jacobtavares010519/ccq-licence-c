import { SEED_ITEM_IDS } from "@/lib/db";
import { ItemDetailClient } from "./_client";

export function generateStaticParams() {
  return SEED_ITEM_IDS.map((id) => ({ id }));
}

interface Props { params: Promise<{ id: string }> }

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ItemDetailClient id={id} />;
}
