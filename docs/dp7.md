# Company Endpoints

## **LinkedIn Posts Keyword Search (real-time)**

**Overview:** This endpoint retrieves LinkedIn posts containing specified keywords along with related engagement metrics.

Each request returns 5 posts per page. To paginate, increment the `page`  in the payload.

Required: authentication token `auth_token` for authorization.

- **Request**
    
    **Request Body Overview** 
    
    The request body is a JSON object that contains the following parameters:
    
    | **Parameter** | **Description** | Default | **Required** |
    | --- | --- | --- | --- |
    | keyword | The keyword or phrase to search for in LinkedIn posts. |  | Yes |
    | page | Page number for pagination | 1 | Yes |
    | limit | Limit the number of posts in a page | 5 | No |
    | sort_by | Defines the sorting order of the results 
    Can be either of the following:
    1. “relevance” - to sort on top match
    2. “date_posted” - to sort on latest posts | “date_posted” | No |
    | date_posted | Filters posts by the date they were posted.
    Can be one of the following:
    1. “past-24h” - Posts from last 24 hours
    2. “past-week” - Post from last 7 days
    3. “past-month” - Post from last 30 days
    4. “past-quarter” - Post from last 3 months
    5. “past-year” - Post from last 1 year | “past-24h” | No |
    
     * `limit` can not exceed 5 when `page` is provided in the payload. To retrieve posts in bulk, use the `limit` parameter (with value over 5 allowed here) without the `page`  parameter.
    
    In the example below, we get LinkedIn posts that meet the following criteria:
    
    - Get all the posts with “***LLM evaluation”***  keyword
    - Posted in last 3 months
    
    - **cURL**
        
        ```bash
        curl 'https://api.crustdata.com/screener/linkedin_posts/keyword_search/' \
        -H 'Accept: application/json, text/plain, */*' \
        -H 'Accept-Language: en-US,en;q=0.9' \
        -H 'Authorization: Token $auth_token' \
        -H 'Connection: keep-alive' \
        -H 'Content-Type: application/json' \
        -H 'Origin: https://crustdata.com' \
        --data-raw '{
           "keyword":"LLM Evaluation",
           "page":1,
           "sort_by":"relevance",
           "date_posted":"past-quarter"
        }' \
        --compressed
        ```
        
    - **Python**
        
        ```python
        import requests
        
        headers = {
            'Accept': 'application/json, text/plain, /',
            'Accept-Language': 'en-US,en;q=0.9',
            'Authorization': 'Token $auth_token', **# replace $auth_token**
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Origin': 'https://crustdata.com'
        }
        
        json_data = {
           "keyword":"LLM Evaluation",
           "page":1,
           "sort_by":"relevance",
           "date_posted":"past-quarter"
        }
        
        response = requests.post('https://api.crustdata.com/screener/linkedin_posts/keyword_search/', headers=headers, json=json_data)
        ```
        
- **Response**:
    
    The response provides a list of recent LinkedIn posts for the specified company, including post content, engagement metrics, and information about users who interacted with the posts.
    
    Refer to `actor_type` field to identify if the post is published by a person or a company 
    
    Full sample: https://jsonhero.io/j/XIqoVuhe2x9w
    
- **Key Points**
    - **Credits:**
        - Each successful page request costs 5 credits.
    - **Pagination:**
        - Increment the value of `page` query param to fetch the next set of posts. Each page has 5 posts.
        - `limit` can not exceed 5 when `page` is provided in the payload. To retrieve posts in bulk, use the `limit` parameter (with value over 5 allowed here) without the `page`  parameter.
    - **Latency:** The data is fetched in real-time from Linkedin and the latency for this endpoint is between 5 to 10 seconds depending on number of posts fetched in a request.