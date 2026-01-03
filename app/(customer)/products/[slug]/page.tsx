// app/(customer)/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { BargainRequestModel } from "@/models/BargainRequest";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import RelatedProducts from "@/components/products/RelatedProducts";
import { auth } from "@/auth";
import { log } from "@/lib/logger";
import { ImageProps } from "@/types";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();

  const product = await ProductModel.findOne({ slug, isActive: true })
    .select("name description metaTitle metaDescription keywords images")
    .lean()
    .exec();

  if (!product) {
    return {
      title: "Product Not Found - Mega Prize Mall",
      description: "The product you are looking for does not exist.",
    };
  }

  const price =
    product.discountedPrice > 0 ? product.discountedPrice : product.price;
  const bargainText = product.bargainEnabled ? " | Bargain Available" : "";
  const colorText = product.color ? ` ${product.color}` : "";

  const title =
    product.metaTitle + " | Mega Prize Mall" ||
    `${product.name}${colorText} | ${product.brand} ${product.category} | Rs ${price}${bargainText} | Mega Prize Mall`;
  const description =
    product.metaDescription ||
    `${product.description.slice(0, 120)}. Buy ${product.name} for ${
      product.brand
    } phones. ${
      product.bargainEnabled ? "Negotiate price with bargain option. " : ""
    }Free shipping. 10-day returns.`;
  const image = product.images?.[0]?.url || "/default-product.jpg";

  return {
    title,
    description,
    keywords: product.keywords?.join(", ") || product.name,
    openGraph: {
      title: product.metaTitle || `${product.name} | Rs ${price}${bargainText}`,
      description:
        product.metaDescription ||
        product.shortDescription ||
        product.description.slice(0, 200),
      type: "website",
      url: `https://megaprizemall.com/products/${slug}`,
      images: product.images?.slice(0, 4).map((img: ImageProps) => ({
        url: img.url,
        width: img.metadata?.width || 1200,
        height: img.metadata?.height || 630,
        alt: img.alt || `${product.name} - ${product.category}`,
      })) || [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      siteName: "Mega Prize Mall",
    },
    alternates: {
      canonical: `https://megaprizemall.com/products/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: product.metaTitle || `${product.name} | Rs ${price}${bargainText}`,
      description:
        product.metaDescription ||
        product.shortDescription ||
        product.description.slice(0, 200),
      images: [image],
      creator: "@megaprizemall",
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { slug } = await params;
  const session = await auth();

  try {
    await connectToDatabase();

    // Fetch product and related data in parallel
    const [product, bargainHistory, sessionData] = await Promise.all([
      // Fetch product with essential fields only
      ProductModel.findOne({ slug, isActive: true }).lean(),

      // Fetch user's bargain history if logged in
      session?.user
        ? BargainRequestModel.find({
            productId: { $exists: true }, // Will update after product fetch
            userId: session.user.id,
            isActive: true,
          })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
        : Promise.resolve([]),

      // Get fresh session for client component
      Promise.resolve(session),
    ]);

    if (!product) {
      notFound();
    }

    // Increment view count (fire and forget)
    ProductModel.findByIdAndUpdate(
      product._id,
      { $inc: { viewCount: 1 } },
      { new: false }
    ).catch((error) => {
      log.error("Failed to increment view count", {
        productId: product._id,
        error: error as Error,
      });
    });

    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
        {/* Add Breadcrumb Schema */}
        <BreadcrumbSchema
          items={[
            { name: "Home", url: "/" },
            { name: "Products", url: "/products" },
            {
              name: product.category,
              url: `/categories/${product.category
                .toLowerCase()
                .replace(/\s+/g, "-")}`,
            },
            { name: product.name, url: `/products/${product.slug}` },
          ]}
        />
        <div className="container mx-auto px-4 py-8">
          {/* Product Detail */}
          <ProductDetailClient
            product={JSON.parse(JSON.stringify(product))}
            userId={sessionData?.user?.id}
            // userBargainHistory={updatedBargainHistory}
          />

          {/* Related Products */}
          <RelatedProducts
            currentProductId={product._id.toString()}
            category={product.category}
            tags={product.tags}
          />
        </div>
      </div>
    );
  } catch (error) {
    log.error("Product page error", { slug, error: error as Error });
    throw error;
  }
}

// Generate static paths for popular products
export async function generateStaticParams() {
  await connectToDatabase();

  const products = await ProductModel.find({
    isActive: true,
    isFeatured: true,
  })
    .select("slug")
    .limit(100) // Generate static pages for top 100 featured products
    .lean();

  return products.map((product) => ({
    slug: product.slug,
  }));
}
