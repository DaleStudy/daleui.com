import { Box, Heading, Text, VStack } from "daleui";

export default function BoxAs() {
  return (
    <Box as="article" padding="16">
      <VStack align="stretch" gap="16">
        <Box as="header">
          <Heading level={2} size={4}>
            주간 리포트
          </Heading>
        </Box>
        <Box as="section">
          <Text as="p">지난 7일 동안 방문자가 12% 늘었습니다.</Text>
        </Box>
        <Box as="footer">
          <Text as="small" muted>
            집계는 매일 오전 9시에 갱신됩니다.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
