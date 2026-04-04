from google import genai
from openai import OpenAI
from os import getenv

gemini_client = genai.Client(api_key = getenv("GEMINI_API_KEY"))
openai_client = OpenAI(api_key=getenv("OPENAI_API_KEY"))


def gemini(meta):
    prompt = meta
    contents = ["The user query is: "+prompt]
    
    response = gemini_client.models.generate_content(
    model="gemini-2.5-flash",
    contents=contents,
    )

    if 'myfile' in locals():
        gemini_client.files.delete(name=myfile.name)

    return response.text

def gpt(meta):
    content = meta
    response = openai_client.chat.completions.create(
        model="gpt-4.1-mini",  # or "gpt-4.1" / "gpt-3.5-turbo"
        messages=[
            {"role": "user", "content": content}
        ]
    )

    return str(response.choices[0].message.content)
