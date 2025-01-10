# Company Endpoints

## **Enrichment: Company Data API**

**Overview:** This endpoint enriches company data by retrieving detailed information about one or multiple companies using either their domain, name, or ID.

Required: authentication token `auth_token` for authorization.

- **Request**
    
    **Parameters**
    
    - **company_domain**: *string* (comma-separated list, up to 25 domains)
        - **Description:** The domain(s) of the company(ies) you want to retrieve data for.
        - **Example:** `company_domain=hubspot.com,google.com`
    - **company_name**: *string* (comma-separated list, up to 25 names; use double quotes if names contain commas)
        - **Description:** The name(s) of the company(ies) you want to retrieve data for.
        - **Example:** `company_name="Acme, Inc.","Widget Co"`
    - **company_linkedin_url**: *string* (comma-separated list, up to 25 URLs)
        - **Description:** The LinkedIn URL(s) of the company(ies).
        - **Example:** `company_linkedin_url=https://linkedin.com/company/hubspot,https://linkedin.com/company/clay-hq`
    - **company_id**: *integer* (comma-separated list, up to 25 IDs)
        - **Description:** The unique ID(s) of the company(ies) you want to retrieve data for.
        - **Example:** `company_id=12345,67890`
    - **fields**: *string* (comma-separated list of fields)
        - **Description:** Specifies the fields you want to include in the response. Supports nested fields up to a certain level.
        - **Example:** `fields=company_name,company_domain,glassdoor.glassdoor_review_count`
    - **enrich_realtime**: *boolean* (False by default)
        - Description: When True and the requested company is not present in Crustdata’s database, the company is enriched within 10 minutes of the request
    
    ### **Using the `fields` Parameter**
    
    The `fields` parameter allows you to customize the response by specifying exactly which fields you want to retrieve. This can help reduce payload size and improve performance.
    
    ### **Important Notes**
    
    - **Nested Fields:** You can specify nested fields up to the levels defined in the response structure (see [Field Structure](https://www.notion.so/Crustdata-Discovery-And-Enrichment-API-c66d5236e8ea40df8af114f6d447ab48?pvs=21) below). Fields nested beyond the allowed levels or within lists (arrays) cannot be individually accessed.
    - **Default Fields:**
        - **Top-Level Non-Object Fields:** If you do not specify the `fields` parameter, the response will include all top-level non-object fields by default (e.g., `company_name`, `company_id`).
        - **Object Fields:** By default, the response **will not include** object fields like `decision_makers` and `founders.profiles`, even if you have access to them. To include these fields, you must explicitly specify them using the `fields` parameter.
    - **User Permissions:** Access to certain fields may be restricted based on your user permissions. If you request fields you do not have access to, the API will return an error indicating unauthorized access.
    
    ### Examples
    
    - **Request by Company Domain:**
        - **Use Case:** Ideal for users who have one or more company website domains and need to fetch detailed profiles.
        - **Note:** You can provide up to 25 domains in a comma-separated list.
        - **Request:**
            
            ```bash
            curl 'https://api.crustdata.com/screener/company?company_domain=hubspot.com,google.com' \
              --header 'Accept: application/json, text/plain, */*' \
              --header 'Accept-Language: en-US,en;q=0.9' \
              --header 'Authorization: Token $token'
            ```
            
    - **Request by Company Name:**
        - **Use Case:** Suitable for users who have one or more company names and need to retrieve detailed profiles.
        - **Note:** You can provide up to 25 names in a comma-separated list. If a company name contains a comma, enclose the name in double quotes.
        - **Request:**
            
            ```bash
            curl 'https://api.crustdata.com/screener/company?company_name="HubSpot","Google, Inc."' \
              --header 'Accept: application/json, text/plain, */*' \
              --header 'Accept-Language: en-US,en;q=0.9' \
              --header 'Authorization: Token $token'
            ```
            
    - **Request by Company LinkedIn URL:**
        - **Use Case:** Suitable for users who have one or more company Linkedin urls and need to retrieve detailed profiles.
        - **Note:** You can provide up to 25 names in a comma-separated list. If a company name contains a comma, enclose the name in double quotes.
        - **Request:**
            
            ```bash
            curl 'https://api.crustdata.com/screener/company?company_linkedin_url=https://linkedin.com/company/hubspot,https://linkedin.com/company/clay-hq' \
              --header 'Accept: application/json, text/plain, */*' \
              --header 'Accept-Language: en-US,en;q=0.9' \
              --header 'Authorization: Token $token'
            ```
            
    - **Request by Company ID:**
        - **Use Case:** Suitable for users who have ingested one or more companies from Crustdata already and want to enrich their data by Crustdata’s `company_id`. Users generally use this when they want time-series data for specific companies after obtaining the `company_id` from the [screening endpoint](https://www.notion.so/Crustdata-Discovery-And-Enrichment-API-c66d5236e8ea40df8af114f6d447ab48?pvs=21).
        - **Note:** You can provide up to 25 IDs in a comma-separated list.
        - **Request:**
            
            ```bash
            curl 'https://api.crustdata.com/screener/company?company_id=631480,789001' \
              --header 'Accept: application/json, text/plain, */*' \
              --header 'Accept-Language: en-US,en;q=0.9' \
              --header 'Authorization: Token $token'
            ```
            
    - **Request with Specific Fields**
        - **Use Case:** Fetch only specific fields to tailor the response to your needs.
        - **Request**
            
            ```bash
            curl 'https://api.crustdata.com/screener/company?company_domain=swiggy.com&fields=company_name,headcount.linkedin_headcount' \
              --header 'Authorization: Token $token' \
              --header 'Accept: application/json'
            ```
            
        - **More examples of Using `fields` parameter**
            
            ### **Example 1: Request Specific Top-Level Fields**
            
            **Request:**
            
            ```bash
            curl 'https://api.crustdata.com/screener/company?company_id=123&fields=company_name,company_website_domain' \
              --header 'Authorization: Token $token' \
              --header 'Accept: application/json'
            ```
            
            **Response Includes:**
            
            - **company_name**
            - **company_website_domain**
            - rest of [top-level fields](https://www.notion.so/Crustdata-Discovery-And-Enrichment-API-c66d5236e8ea40df8af114f6d447ab48?pvs=21)
            
            ### **Example 2: Request Nested Fields**
            
            **Request:**
            
            ```bash
            curl 'https://api.crustdata.com/screener/company?company_id=123&fields=glassdoor.glassdoor_overall_rating,glassdoor.glassdoor_review_count' \
              --header 'Authorization: Token $token' \
              --header 'Accept: application/json'
            ```
            
            **Response Includes:**
            
            - **glassdoor**
                - **glassdoor_overall_rating**
                - **glassdoor_review_count**
            - rest of [top-level fields](https://www.notion.so/Crustdata-Discovery-And-Enrichment-API-c66d5236e8ea40df8af114f6d447ab48?pvs=21)
            
            ### **Example 3: Include 'decision_makers' and 'founders.profiles'**
            
            **Request:**
            
            ```bash
            curl 'https://api.crustdata.com/screener/company?company_id=123&fields=decision_makers,founders.profiles' \
              --header 'Authorization: Token $token' \
              --header 'Accept: application/json'
            ```
            
            **Response Includes:**
            
            - **decision_makers**: Full array of decision-maker profiles.
            - **founders**
                - **profiles**: Full array of founder profiles.
            - rest of [top-level fields](https://www.notion.so/Crustdata-Discovery-And-Enrichment-API-c66d5236e8ea40df8af114f6d447ab48?pvs=21)
            
            ### **Example 4: Requesting Unauthorized Fields**
            
            Assuming you do not have access to the `headcount` field.
            
            **Request:**
            
            ```bash
            curl 'https://api.crustdata.com/screener/company?company_id=123&fields=company_name,headcount' \
              --header 'Authorization: Token $token' \
              --header 'Accept: application/json'
            ```
            
            **Error Response:**
            
            ```bash
            {
              "error": "Unauthorized access to field(s): headcount"
            }
            
            ```
            
    - **Request with Realtime Enrichment**
        - **Use Case:** For companies not tracked by Crustdata, you want to enrich them within 10 minutes of the request
        
        ```bash
        curl --location 'https://api.crustdata.com/screener/company?company_linkedin_url=https://www.linkedin.com/company/usebramble&enrich_realtime=True' \
        --header 'Accept: application/json, text/plain, /' \
        --header 'Accept-Language: en-US,en;q=0.9' \
        --header 'Authorization: Token $token'
        ```
        
- **Response Structure**
    
    The response is a JSON array containing company objects. Below is the structure of the response up to the levels where you can filter using the `fields` parameter.
    
    ## **Top-Level Fields**
    
    - **company_id**: *integer*
    - **company_name**: *string*
    - **linkedin_profile_url**: *string*
    - **linkedin_id**: *string*
    - **linkedin_logo_url**: *string*
    - **company_twitter_url**: *string*
    - **company_website_domain**: *string*
    - **hq_country**: *string*
    - **headquarters**: *string*
    - **largest_headcount_country**: *string*
    - **hq_street_address**: *string*
    - **company_website**: *string*
    - **year_founded**: *string* (ISO 8601 date)
    - **fiscal_year_end**: *string*
    - **estimated_revenue_lower_bound_usd**: *integer*
    - **estimated_revenue_higher_bound_usd**: *integer*
    - **employee_count_range**: *string*
    - **company_type**: *string*
    - **linkedin_company_description**: *string*
    - **acquisition_status**: *string* or *null*
    - **ceo_location**: *string*
    
    ## **Nested Objects**
    
    You can filter up to the following nested levels:
    
    ### **all_office_addresses**
    
    - *array of strings*
    
    ### **markets**
    
    - *array of strings*
    
    ### **stock_symbols**
    
    - *array of strings*
    
    ### **taxonomy**
    
    - **linkedin_specialities**: *array of strings*
    - **linkedin_industries**: *array of strings*
    - **crunchbase_categories**: *array of strings*
    
    ### **competitors**
    
    - **competitor_website_domains**: *array of strings* or *null*
    - **paid_seo_competitors_website_domains**: *array of strings*
    - **organic_seo_competitors_website_domains**: *array of strings*
    
    ### **headcount**
    
    - **linkedin_headcount**: *integer*
    - **linkedin_headcount_total_growth_percent**
        - **mom**: *float*
        - **qoq**: *float*
        - **six_months**: *float*
        - **yoy**: *float*
        - **two_years**: *float*
    - **linkedin_headcount_total_growth_absolute**
        - **mom**: *float*
        - **qoq**: *float*
        - **six_months**: *float*
        - **yoy**: *float*
        - **two_years**: *float*
    - **linkedin_headcount_by_role_absolute**: *object*
    - **linkedin_headcount_by_role_percent**: *object*
    - **linkedin_role_metrics**
        - **all_roles**: *string*
        - **0_to_10_percent**: *string*
        - **11_to_30_percent**: *string*
        - **31_to_50_percent**: *string* or *null*
        - **51_to_70_percent**: *string* or *null*
        - **71_to_100_percent**: *string* or *null*
    - **linkedin_headcount_by_role_six_months_growth_percent**: *object*
    - **linkedin_headcount_by_role_yoy_growth_percent**: *object*
    - **linkedin_headcount_by_region_absolute**: *object*
    - **linkedin_headcount_by_region_percent**: *object*
    - **linkedin_region_metrics**
        - **all_regions**: *string*
        - **0_to_10_percent**: *string*
        - **11_to_30_percent**: *string*
        - **31_to_50_percent**: *string* or *null*
        - **51_to_70_percent**: *string* or *null*
        - **71_to_100_percent**: *string* or *null*
    - **linkedin_headcount_by_skill_absolute**: *object*
    - **linkedin_headcount_by_skill_percent**: *object*
    - **linkedin_skill_metrics**
        - **all_skills**: *string*
        - **0_to_10_percent**: *string* or *null*
        - **11_to_30_percent**: *string*
        - **31_to_50_percent**: *string* or *null*
        - **51_to_70_percent**: *string* or *null*
        - **71_to_100_percent**: *string* or *null*
    - **linkedin_headcount_timeseries**: *array of objects* (Cannot filter within this array)
    - **linkedin_headcount_by_function_timeseries**: *object* (Cannot filter within this object)
    
    ### **web_traffic**
    
    - **monthly_visitors**: *integer*
    - **monthly_visitor_mom_pct**: *float*
    - **monthly_visitor_qoq_pct**: *float*
    - **traffic_source_social_pct**: *float*
    - **traffic_source_search_pct**: *float*
    - **traffic_source_direct_pct**: *float*
    - **traffic_source_paid_referral_pct**: *float*
    - **traffic_source_referral_pct**: *float*
    - **monthly_visitors_timeseries**: *array of objects* (Cannot filter within this array)
    - **traffic_source_social_pct_timeseries**: *array of objects* (Cannot filter within this array)
    - **traffic_source_search_pct_timeseries**: *array of objects* (Cannot filter within this array)
    - **traffic_source_direct_pct_timeseries**: *array of objects* (Cannot filter within this array)
    - **traffic_source_paid_referral_pct_timeseries**: *array of objects* (Cannot filter within this array)
    - **traffic_source_referral_pct_timeseries**: *array of objects* (Cannot filter within this array)
    
    ### **glassdoor**
    
    - **glassdoor_overall_rating**: *float*
    - **glassdoor_ceo_approval_pct**: *integer*
    - **glassdoor_business_outlook_pct**: *integer*
    - **glassdoor_review_count**: *integer*
    - **glassdoor_senior_management_rating**: *float*
    - **glassdoor_compensation_rating**: *float*
    - **glassdoor_career_opportunities_rating**: *float*
    - **glassdoor_culture_rating**: *float* or *null*
    - **glassdoor_diversity_rating**: *float* or *null*
    - **glassdoor_work_life_balance_rating**: *float* or *null*
    - **glassdoor_recommend_to_friend_pct**: *integer* or *null*
    - **glassdoor_ceo_approval_growth_percent**
        - **mom**: *float*
        - **qoq**: *float*
        - **yoy**: *float*
    - **glassdoor_review_count_growth_percent**
        - **mom**: *float*
        - **qoq**: *float*
        - **yoy**: *float*
    
    ### **g2**
    
    - **g2_review_count**: *integer*
    - **g2_average_rating**: *float*
    - **g2_review_count_mom_pct**: *float*
    - **g2_review_count_qoq_pct**: *float*
    - **g2_review_count_yoy_pct**: *float*
    
    ### **linkedin_followers**
    
    - **linkedin_followers**: *integer*
    - **linkedin_follower_count_timeseries**: *array of objects* (Cannot filter within this array)
    - **linkedin_followers_mom_percent**: *float*
    - **linkedin_followers_qoq_percent**: *float*
    - **linkedin_followers_six_months_growth_percent**: *float*
    - **linkedin_followers_yoy_percent**: *float*
    
    ### **funding_and_investment**
    
    - **crunchbase_total_investment_usd**: *integer*
    - **days_since_last_fundraise**: *integer*
    - **last_funding_round_type**: *string*
    - **crunchbase_investors**: *array of strings*
    - **last_funding_round_investment_usd**: *integer*
    - **funding_milestones_timeseries**: *array of objects* (Cannot filter within this array)
    
    ### **job_openings**
    
    - **recent_job_openings_title**: *string* or *null*
    - **job_openings_count**: *integer* or *null*
    - **job_openings_count_growth_percent**
        - **mom**: *float* or *null*
        - **qoq**: *float* or *null*
        - **yoy**: *float* or *null*
    - **job_openings_by_function_qoq_pct**: *object*
    - **job_openings_by_function_six_months_growth_pct**: *object*
    - **open_jobs_timeseries**: *array of objects* (Cannot filter within this array)
    - **recent_job_openings**: *array of objects* (Cannot filter within this array)
    
    ### **seo**
    
    - **average_seo_organic_rank**: *integer*
    - **monthly_paid_clicks**: *integer*
    - **monthly_organic_clicks**: *integer*
    - **average_ad_rank**: *integer*
    - **total_organic_results**: *integer* or *float*
    - **monthly_google_ads_budget**: *integer* or *float*
    - **monthly_organic_value**: *integer*
    - **total_ads_purchased**: *integer*
    - **lost_ranked_seo_keywords**: *integer*
    - **gained_ranked_seo_keywords**: *integer*
    - **newly_ranked_seo_keywords**: *integer*
    
    ### **founders**
    
    - **founders_locations**: *array of strings*
    - **founders_education_institute**: *array of strings*
    - **founders_degree_name**: *array of strings*
    - **founders_previous_companies**: *array of strings*
    - **founders_previous_titles**: *array of strings*
    - **profiles**: *array of objects* (Cannot filter within this array)
    
    ### **decision_makers**
    
    - **decision_makers**: *array of objects* (Cannot filter within this array)
    
    ### **news_articles**
    
    - **news_articles**: *array of objects* (Cannot filter within this array)
- **Response**
    
    ### Examples
    
    The response provides a comprehensive profile of the company, including firmographic details, social media links, headcount data, and growth metrics. 
    
    For a detailed response data structure, refer to this JSON https://jsonhero.io/j/QN8Qj7dg8MbW
    
- **Key Points**
    
    ### **Credits**
    
    - **Database Enrichment:**
        - **1 credits** per company.
    - **Real-Time Enrichment (enrich_realtime=True):**
        - **4+1 credits** per company.
    
    ### Enrichment Status
    
    When you request data for a company not in our database, we start an enrichment process that takes up to **24 hours** (or **10 minutes** if `enrich_realtime` is `true`).
    
    The API response includes a `status` field:
    
    - `enriching` : The company is being processed, poll later to get the full company info
    - `not_found` : Enrichment failed (e.g., no website or employees). You can stop polling for this company.
    
    ```jsx
    [
      {
        "status": "enriching",
        "message": "The following companies will be enriched in the next 24 hours",
        "companies": [
          {
            "identifier": "https://www.linkedin.com/company/123456",
            "type": "linkedin_url"
          }
        ]
      }
    ]
    
    ```
    
    ### **Limitations on Nested Fields**
    
    - **Maximum Nesting Level:** You can specify nested fields **only up to the levels defined above**
    - **Default Exclusion of Certain Fields:** Even if you have access to fields like `decision_makers` and `founders.profiles`, they **will not be included** in the response by default when the `fields` parameter is not provided. You must explicitly request these fields using the `fields` parameter.
        - **Example:**
            
            ```bash
            # Will not include 'decision_makers' or 'founders.profiles' by default
            curl 'https://api.crustdata.com/screener/company?company_id=123' \
              --header 'Authorization: Token $token' \
              --header 'Accept: application/json'
            ```
            
            To include them, specify in `fields`:
            
            ```bash
            curl 'https://api.crustdata.com/screener/company?company_id=123&fields=decision_makers,founders.profiles' \
              --header 'Authorization: Token $token' \
              --header 'Accept: application/json'
            ```
            
    - **Unavailable Fields:** If you request a field that is not available or beyond the allowed nesting level, the API will return an error indicating that the field is not available for filtering.


Create a json file out of this endpoint purely for the purpose of RAG and pincone upsert and retrival 

use appropriate 
don't miss any of the information otherwise the consequences will be terrible. 
