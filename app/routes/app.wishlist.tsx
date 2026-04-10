import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page, Layout, Card, Text, BlockStack, InlineStack, Badge,
  IndexTable, Pagination, EmptyState, Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { findOrCreateStore, getAllWishlists } from "../services/wishlist.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const store = await findOrCreateStore(session.shop);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const data = await getAllWishlists(store.id, page, 20);
  return json({ ...data, shop: session.shop });
};

export default function WishlistAdmin() {
  const { wishlists, total, page, totalPages } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (wishlists.length === 0 && page === 1) {
    return (
      <Page>
        <TitleBar title="Wishlists" />
        <Card>
          <EmptyState heading="No wishlists yet" image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
            <p>Wishlists will appear here once customers start saving products.</p>
          </EmptyState>
        </Card>
      </Page>
    );
  }

  const rowMarkup = wishlists.map(
    (wl: any, index: number) => {
      const isGuest = wl.customerId.startsWith("guest_");
      const lastActive = new Date(wl.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      return (
        <IndexTable.Row id={wl.id} key={wl.id} position={index}>
          <IndexTable.Cell>
            <InlineStack gap="200" blockAlign="center">
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {wl.customerId.slice(0, 20)}{wl.customerId.length > 20 ? "..." : ""}
              </Text>
              {isGuest && <Badge tone="info">Guest</Badge>}
            </InlineStack>
          </IndexTable.Cell>
          <IndexTable.Cell><Text as="span">{wl.name}</Text></IndexTable.Cell>
          <IndexTable.Cell><Badge>{wl._count.items} items</Badge></IndexTable.Cell>
          <IndexTable.Cell><Text as="span" variant="bodySm" tone="subdued">{lastActive}</Text></IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  return (
    <Page>
      <TitleBar title="Wishlists" />
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <IndexTable
              resourceName={{ singular: "wishlist", plural: "wishlists" }}
              itemCount={total}
              headings={[{ title: "Customer" }, { title: "Name" }, { title: "Items" }, { title: "Last Active" }]}
              selectable={false}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
          {totalPages > 1 && (
            <Box paddingBlockStart="400">
              <InlineStack align="center">
                <Pagination
                  hasPrevious={page > 1} onPrevious={() => navigate(`?page=${page - 1}`)}
                  hasNext={page < totalPages} onNext={() => navigate(`?page=${page + 1}`)}
                />
              </InlineStack>
            </Box>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
