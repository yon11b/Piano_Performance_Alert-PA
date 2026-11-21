import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from enrich import classify


class ClassificationTests(unittest.TestCase):
    def test_notion_artist_in_title_or_cast(self):
        self.assertEqual(classify("조성진 피아노 리사이틀", "", "50,000원"), "WORLD")
        self.assertEqual(classify("협주곡의 밤", "임윤찬, 오케스트라", ""), "WORLD")

    def test_highest_price_threshold(self):
        self.assertEqual(classify("공연", "", "R석 200,000원, S석 50,000원"), "WORLD")
        self.assertEqual(classify("공연", "", "전석 20만원"), "WORLD")
        self.assertIsNone(classify("공연", "", "전석 199,000원"))

    def test_unknown_is_not_a_beginner(self):
        self.assertIsNone(classify("피아노 독주회", "처음 보는 연주자", None))
        self.assertIsNone(classify(None, None, None))


if __name__ == "__main__":
    unittest.main()
