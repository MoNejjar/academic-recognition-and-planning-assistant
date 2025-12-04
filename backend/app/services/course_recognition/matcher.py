"""
Course Matcher

Core logic for matching external courses to TUM modules
"""

# TODO: Implement semantic matching using embeddings
# TODO: Implement hybrid matching (semantic + keyword)
# TODO: Implement one-to-one course matching
# TODO: Implement multiple-to-one course matching (e.g., Discrete Maths 1+2 = Discrete Structures)


class CourseMatcher:
    """Matches external courses to TUM modules"""
    
    def __init__(self, llm_client):
        self.llm_client = llm_client
    
    async def match_course(self, source_course, target_curriculum: str):
        """Match a single external course to TUM modules"""
        # TODO: Implement
        raise NotImplementedError
    
    async def match_multiple_courses(self, source_courses: list, target_curriculum: str):
        """Match multiple external courses that may combine to one TUM module"""
        # TODO: Implement
        raise NotImplementedError
