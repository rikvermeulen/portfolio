import { toRecipeCard } from "./toRecipeCard.ts";

describe("toRecipeCard", () => {
  it("proxies the image and derives the recipe URL when absent", () => {
    const card = toRecipeCard(
      { id: "abc", title: "Gyoza", imageAssetId: "recipes/hash" },
      "nl",
    );
    expect(card.recipeUrl).toBe("https://picnic.app/nl/recepten/abc");
    expect(card.imageUrl).toBe(
      "/api/picnic/image?url=" +
        encodeURIComponent(
          "https://storefront-prod.nl.picnicinternational.com/static/images/recipes/hash/filled-600x600.webp",
        ),
    );
  });

  it("keeps an explicit recipe URL and direct image URL", () => {
    const card = toRecipeCard(
      {
        id: "x",
        title: "Soup",
        recipeUrl: "https://picnic.app/nl/recepten/custom",
        imageUrl: "https://cdn.example.com/soup.jpg",
      },
      "de",
    );
    expect(card.recipeUrl).toBe("https://picnic.app/nl/recepten/custom");
    expect(card.imageUrl).toBe(
      "/api/picnic/image?url=" +
        encodeURIComponent("https://cdn.example.com/soup.jpg"),
    );
  });

  it("leaves imageUrl undefined when there is no image", () => {
    const card = toRecipeCard({ id: "y", title: "Bread" }, "nl");
    expect(card.imageUrl).toBeUndefined();
  });
});
