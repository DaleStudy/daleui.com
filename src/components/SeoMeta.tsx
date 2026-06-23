export interface SeoMetaProps {
  /** `<title>`과 og:title/twitter:title에 그대로 쓰입니다. */
  title: string;
  /** 메타 description. 없으면 빈 문자열. */
  description?: string;
  /** og:image/twitter:image 절대 URL. */
  image: string;
  /** og:type (기본 "website", 글 상세는 "article"). */
  type?: "website" | "article";
  /** og:url 절대 URL(선택). */
  url?: string;
}

export function SeoMeta({
  title,
  description = "",
  image,
  type = "website",
  url,
}: SeoMetaProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
