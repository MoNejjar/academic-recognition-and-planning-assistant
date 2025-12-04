"""
Assessment Generator

Generates match scores and transferability reports
"""

# TODO: Implement match score calculation
# TODO: Implement transferability assessment
# TODO: Implement explainability (why does it match/not match)
# TODO: Implement grade calculation (passing/not passing)


class AssessmentGenerator:
    """Generates assessments for course matching"""
    
    def __init__(self, llm_client):
        self.llm_client = llm_client
    
    async def generate_assessment(self, match_result):
        """Generate detailed assessment for a match"""
        # TODO: Implement
        raise NotImplementedError
    
    async def calculate_grade(self, source_grades: list, target_course):
        """Calculate if combined grades result in passing/not passing"""
        # TODO: Implement
        raise NotImplementedError
