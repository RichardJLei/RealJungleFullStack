import json
import os
import psycopg2
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def load_categories(file_path):
    with open(file_path) as f:
        categories = json.load(f)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    inserted = 0
    for cat in categories:
        try:
            cur.execute(
                "INSERT INTO categories (id, title) VALUES (%s, %s)",
                (cat['id'], cat['title'])
            )
            inserted += 1
        except Exception as e:
            print(f"Error inserting category {cat}: {str(e)}")
    
    conn.commit()
    cur.close()
    conn.close()
    return inserted

def load_blog_posts(file_path):
    with open(file_path) as f:
        posts = json.load(f)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    inserted = 0
    for post in posts:
        try:
            cur.execute(
                """INSERT INTO blog_posts 
                (id, title, content, category_id, status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)""",
                (
                    post['id'],
                    post['title'],
                    post['content'],
                    post['category']['id'],
                    post['status'],
                    datetime.fromisoformat(post['createdAt'])
                )
            )
            inserted += 1
        except Exception as e:
            print(f"Error inserting post {post['id']}: {str(e)}")
    
    conn.commit()
    cur.close()
    conn.close()
    return inserted

if __name__ == "__main__":
    categories_count = load_categories(".\categories.json")
    posts_count = load_blog_posts("blog_posts.json")
    

    print(f"Successfully inserted {categories_count} categories")
    print(f"Successfully inserted {posts_count} blog posts") 