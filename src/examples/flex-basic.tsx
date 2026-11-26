import { Flex, Text } from "daleui";

export default function FlexBasic() {
  return (
    <Flex justify="between" gap="16">
      <Text>왼쪽</Text>
      <Text>오른쪽</Text>
    </Flex>
  );
}
