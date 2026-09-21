import logging
from typing import List, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger("atbd.similarity")


class PromptSimilarityEngine:
    """
    Implements Equation (4) from the ATBD paper:
    S_s = Similarity(P_c, P_p)
    Quantifies semantic and lexical similarity between current prompt and previous prompts
    using TF-IDF vectorization and Cosine Similarity.
    """

    @staticmethod
    def calculate_prompt_similarity(current_prompt: str, previous_prompts: List[str]) -> float:
        """
        Returns similarity score S_s normalized to [0, 100].
        If no previous prompts exist in the session, returns 0.0.
        """
        if not previous_prompts or not current_prompt.strip():
            return 0.0

        corpus = list(previous_prompts) + [current_prompt]
        try:
            vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                stop_words="english",
                token_pattern=r"(?u)\b\w+\b"
            )
            tfidf_matrix = vectorizer.fit_transform(corpus)

            # Current prompt is the last row in matrix
            current_vector = tfidf_matrix[-1]
            previous_vectors = tfidf_matrix[:-1]

            # Compute cosine similarities between current prompt and each previous prompt
            similarities = cosine_similarity(current_vector, previous_vectors).flatten()

            if len(similarities) == 0:
                return 0.0

            # Take the maximum similarity with any previous prompt in session
            max_sim = float(np.max(similarities))
            # Scale to 0-100
            score = round(max_sim * 100.0, 2)
            return min(100.0, max(0.0, score))
        except Exception as e:
            logger.warning(f"Error computing TF-IDF prompt similarity: {e}")
            # Fallback simple Jaccard similarity if TF-IDF encountered empty vocabulary
            return PromptSimilarityEngine._jaccard_fallback(current_prompt, previous_prompts)

    @staticmethod
    def _jaccard_fallback(current: str, history: List[str]) -> float:
        words_c = set(current.lower().split())
        if not words_c:
            return 0.0
        max_jaccard = 0.0
        for h in history:
            words_h = set(h.lower().split())
            if not words_h:
                continue
            intersection = len(words_c.intersection(words_h))
            union = len(words_c.union(words_h))
            if union > 0:
                j = intersection / union
                if j > max_jaccard:
                    max_jaccard = j
        return round(max_jaccard * 100.0, 2)
