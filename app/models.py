from dataclasses import dataclass

@dataclass
class Project:
    title: str
    description: str
    technologies: str
    github_url: str
    image_url: str