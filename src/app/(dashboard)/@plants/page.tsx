import { getPlantaPlantsResult } from "@/lib/planta/service.ts";
import { Plants } from "@/modules/Bentos/index.ts";

/**
 * Plants parallel route that fetches Planta data server-side.
 */
export default async function PlantsPage() {
  const result = await getPlantaPlantsResult();

  if (!result.ok) {
    return <Plants errorMessage={result.errorMessage} plants={[]} />;
  }

  return <Plants plants={result.data.plantCards} />;
}
