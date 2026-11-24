import { Flex, Link } from "daleui";

export default function FlexNav() {
  return (
    <Flex as="nav" aria-label="예시 내비게이션" justify="center" gap="24">
      <Link href="/docs/box">Box</Link>
      <Link href="/docs/flex">Flex</Link>
      <Link href="/docs/grid">Grid</Link>
    </Flex>
  );
}
