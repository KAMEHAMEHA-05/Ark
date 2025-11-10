from google import genai
from openai import OpenAI

gemini_client = genai.Client(api_key = "AIzaSyBBuvyJRgqGsSVE7Rgaq1zI4zumD3q02qk")
openai_client = OpenAI(api_key="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")


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
