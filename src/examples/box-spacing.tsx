import { Box, Card, Text } from "daleui";

export default function BoxSpacing() {
  return (
    <Card outline>
      <Box padding="24">
        <Text>Card는 자체 여백이 없어서 안쪽 여백을 Box로 만듭니다.</Text>
      </Box>
    </Card>
  );
}
