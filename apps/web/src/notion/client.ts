import "server-only"
import { Client } from "@notionhq/client"
import { getNotionEnvs } from "@/envs/server"

let client: Client | undefined

export const getNotionClient = () => {
  if (!client) {
    client = new Client({ auth: getNotionEnvs().NOTION_TOKEN })
  }

  return client
}
