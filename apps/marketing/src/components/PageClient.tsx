"use client";

import { useTina } from "tinacms/dist/react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PageClient({ data, query, variables }: { data: any; query: string; variables: any }) {
  const { data: tinaData } = useTina({
    query,
    variables,
    data,
  });

  return <BlockRenderer blocks={tinaData?.page?.blocks} data={tinaData?.page} />;
}
