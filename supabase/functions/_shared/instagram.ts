interface InstagramCredentials {
  businessAccountId: string;
  accessToken: string;
}

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

/**
 * Publica una imagen en Instagram (Graph API). IG no permite links clicables en
 * el caption, así que el link a la nota se agrega como primer comentario.
 */
export async function postToInstagram(
  imageUrl: string,
  caption: string,
  linkComment: string,
  creds: InstagramCredentials
): Promise<{ id: string }> {
  const containerRes = await fetch(
    `${GRAPH_BASE}/${creds.businessAccountId}/media?access_token=${creds.accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl, caption }),
    }
  );
  if (!containerRes.ok) {
    throw new Error(`Instagram (crear contenedor) ${containerRes.status}: ${await containerRes.text()}`);
  }
  const { id: creationId } = await containerRes.json();

  const publishRes = await fetch(
    `${GRAPH_BASE}/${creds.businessAccountId}/media_publish?access_token=${creds.accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: creationId }),
    }
  );
  if (!publishRes.ok) {
    throw new Error(`Instagram (publicar) ${publishRes.status}: ${await publishRes.text()}`);
  }
  const { id: mediaId } = await publishRes.json();

  await fetch(`${GRAPH_BASE}/${mediaId}/comments?access_token=${creds.accessToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: linkComment }),
  });

  return { id: mediaId };
}
