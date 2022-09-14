import axios from 'axios';
import { Config } from './config';

export async function axiom(dataset: string, data: Record<string, unknown>): Promise<void> {
  await axios.post(
    `https://cloud.axiom.co/api/v1/datasets/${encodeURIComponent(dataset)}/ingest`,
    [data],
    {
      headers: {
        authorization: `Bearer ${Config.AXIOM_TOKEN}`,
      },
    }
  );
}
