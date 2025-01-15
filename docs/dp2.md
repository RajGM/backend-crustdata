# Company Endpoints

## **Company Discovery: Screening API**

**Overview:** The company screening API request allows you to screen and filter companies based on various growth and firmographic criteria. 

Required: authentication token `auth_token` for authorization.

- **Request**
    
    In the example below, we get companies that meet the following criteria:
    
    - Have raised > $5,000,000 in total funding AND
    - Have headcount > 50 AND
    - Have largest headcount country as USA
    
    - **cURL**
        
        ```bash
        curl 'https://api.crustdata.com/screener/screen/' \
        -H 'Accept: application/json, text/plain, */*' \
        -H 'Accept-Language: en-US,en;q=0.9' \
        -H 'Authorization: Token $auth_token' \
        -H 'Connection: keep-alive' \
        -H 'Content-Type: application/json' \
        -H 'Origin: https://crustdata.com' \
        --data-raw '{
            "metrics": [
              {
                "metric_name": "linkedin_headcount_and_glassdoor_ceo_approval_and_g2"
              }
            ],
            "filters": {
              "op": "and",
              "conditions": [
                        {
                          "column": "crunchbase_total_investment_usd",
                          "type": "=>",
                          "value": 5000000,
                          "allow_null": false
                        },
                        {
                          "column": "linkedin_headcount",
                          "type": "=>",
                          "value": 50,
                          "allow_null": false
                        },
                        {
                          "column": "largest_headcount_country",
                          "type": "(.)",
                          "value": "USA",
                          "allow_null": false
                        }
              ]
            },
            "hidden_columns": [],
            "offset": 0,
            "count": 100,
            "sorts": []
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
            'metrics': [
                {
                    'metric_name': 'linkedin_headcount_and_glassdoor_ceo_approval_and_g2',
                },
            ],
            'filters': {
                'op': 'and',
                'conditions': [
                    {
                        'column': 'crunchbase_total_investment_usd',
                        'type': '=>',
                        'value': 5000000,
                        'allow_null': False,
                    },
                    {
                        'column': 'linkedin_headcount',
                        'type': '=>',
                        'value': 50,
                        'allow_null': False,
                    },
                    {
                        'column': 'largest_headcount_country',
                        'type': '(.)',
                        'value': 'USA',
                        'allow_null': False,
                    },
                ],
            },
            'hidden_columns': [],
            'offset': 0,
            'count': 100,
            'sorts': []
        }
        
        response = requests.post('https://api.crustdata.com/screener/screen/', headers=headers, json=json_data)
        ```
        
    - **Request Body Overview**
        
        The request body is a JSON object that contains the following parameters:
        
        | **Parameter** | **Description** | **Required** |
        | --- | --- | --- |
        | metrics | An array of metric objects containing the metric name. Value should always be
        `[{"metric_name": "linkedin_headcount_and_glassdoor_ceo_approval_and_g2"}]` | Yes |
        | filters | An object containing the filter conditions. | Yes |
        | offset | The starting point of the result set. Default value is 0. | Yes |
        | count | The number of results to return in a single request. 
        Maximum value is `100`. 
        Default value is `100`. | Yes |
        | sorts | An array of sorting criteria. | No |
        
        ### Parameters:
        
        - **`metrics`**
            
            Dictates the columns in the response. The only possible value is
            
            ```bash
            [{"metric_name": "linkedin_headcount_and_glassdoor_ceo_approval_and_g2"}]
            ```
            
        - **`filters`**
            
            Example: 
            
            ```json
            {
                "op": "and",
                "conditions": [
            		    {
            				    "op": "or",
            				    "conditions": [
            							   {"hq_country", "type": "(.)", "value": "USA"},
            							   {"hq_country", "type": "(.)", "value": "IND"}
            						],
            				}
                    {"column": "crunchbase_total_investment_usd", "type": "=>", "value": "5000000"},
                    {"column": "largest_headcount_country", "type": "(.)", "value": "USA"}
                ]
            }
            ```
            
            The filters object contains the following parameters:
            
            | **Parameter** | **Description** | **Required** |
            | --- | --- | --- |
            | op | The operator to apply on the conditions. The value can be `"and"` or `"or"`. | Yes |
            | conditions | An array of complex filter objects or basic filter objects (see below) | Yes |
        - **`conditions` parameter**
            
            This has two possible types of values
            
            1. **Basic Filter Object**
                
                Example: `{"column": "linkedin_headcount", "type": "=>", "value": "50" }` 
                
                The object contains the following parameters:
                
                | **Parameter** | **Description** | **Required** |
                | --- | --- | --- |
                | column | The name of the column to filter. | Yes |
                | type | The filter type. The value can be "=>", "=<", "=", "!=", “in”, “(.)”, “[.]” | Yes |
                | value | The filter value. | Yes |
                | allow_null | Whether to allow null values. The value can be "true" or "false". Default value is "false". | No |
                - List of all `column` values
                    
                    [Crustdata Data Dictionary](https://www.notion.so/Crustdata-Data-Dictionary-c265aa415fda41cb871090cbf7275922?pvs=21) 
                    
                - List of all `type` values
                    
                    
                    | condition type | condition description | applicable column types | example |
                    | --- | --- | --- | --- |
                    | "=>" | Greater than or equal | number | { "column": "linkedin_headcount", "type": "=>", "value": "50"} |
                    | "=<" | Lesser than or equal | number | { "column": "linkedin_headcount", "type": "=<", "value": "50"} |
                    | "=", | Equal | number | { "column": "linkedin_headcount", "type": "=", "value": "50"} |
                    | “<” | Lesser than | number | { "column": "linkedin_headcount", "type": "<", "value": "50"} |
                    | “>” | Greater than | number | { "column": "linkedin_headcount", "type": ">", "value": "50"} |
                    | “(.)” | Contains, case insensitive | string | { "column": "crunchbase_categories", "type": "(.)", "value": "artificial intelligence"} |
                    | “[.]” | Contains, case sensitive | string | { "column": "crunchbase_categories", "type": "[.]", "value": "Artificial Intelligence"} |
                    | "!=" | Not equals | number |  |
                    | “in” | Exactly matches atleast one of the elements of list | string, number | { "column": "company_id", "type": "in", "value": [123, 346. 564]} |
            2. **Complex Filter Object**
                
                Example: 
                
                ```json
                {
                	 "op": "or",
                	 "conditions": [
                			 {"hq_country", "type": "(.)", "value": "USA"},
                			 {"hq_country", "type": "(.)", "value": "IND"}
                	 ]
                }
                ```
                
                Same schema as the parent [**`filters`**](https://www.notion.so/filters-8a72acfe02a5455e895ea9a9dede08c4?pvs=21) parameter 
                
- **Response**
    
    Example: https://jsonhero.io/j/ntHvSKVeZJIc
    
    The response is JSON object that consists of two main components: `fields` and `rows`.
    
    - **fields**: An array of objects representing the columns in the dataset.
    - **rows**: An array of arrays, each representing a row of data.
    
    The values in each of the `rows` elements are ordered in the same sequence as the fields in the `fields` array. For example, the `i`th value in a row corresponds to the `i`th field in the `fields` array.
    
    - **Parsing the response**
        
        Given the following response object
        
        ```json
        {
          "fields": [
            {"type": "string", "api_name": "company_name", "hidden": false},
            {"type": "number", "api_name": "valuation_usd", "hidden": false},
            {"type": "number", "api_name": "crunchbase_total_investment_usd", "hidden": false},
            {"type": "string", "api_name": "markets", "hidden": false},
            {"type": "number", "api_name": "days_since_last_fundraise", "hidden": false},
            {"type": "number", "api_name": "linkedin_headcount", "hidden": false},
            {"type": "number", "api_name": "linkedin_headcount_mom_percent", "hidden": false}
          ],
          "rows": [
            ["Sketch", null, 20000000, "PRIVATE", 1619, 258, -11.64]
          ]
        }
        ```
        
        The first element in `rows` (i.e. `"Sketch"`) corresponds to `fields[0]["api_name"]` (i.e. `"company_name"`). 
        
        The second element in `rows` (i.e. `null`) corresponds to `fields[1]["api_name"]` (i.e. `"valuation_usd"`), and so on.
        
        ### Pseudo code for mapping `fields` → `rows[i]`
        
        Here's a pseudo code to help understand this mapping:
        
        ```
        for each row in rows:
            for i in range(length(row)):
                field_name = fields[i]["api_name"]
                field_value = row[i]
                # Map field_name to field_value
        ```
        
        In simple terms:
        
        - For each row, iterate over each value.
        - Map the `i`th value of the row to the `i`th `api_name` in the fields.
    
    Here is the complete list of fields in the response for each company
    
    - Complete list of columns
        1. company_name
        2. company_website
        3. company_website_domain
        4. linkedin_profile_url
        5. monthly_visitors
        6. valuation_usd
        7. crunchbase_total_investment_usd
        8. markets
        9. days_since_last_fundraise
        10. linkedin_headcount
        11. linkedin_headcount_mom_percent
        12. linkedin_headcount_qoq_percent
        13. linkedin_headcount_yoy_percent
        14. linkedin_headcount_mom_absolute
        15. linkedin_headcount_qoq_absolute
        16. linkedin_headcount_yoy_absolute
        17. glassdoor_overall_rating
        18. glassdoor_ceo_approval_pct
        19. glassdoor_business_outlook_pct
        20. glassdoor_review_count
        21. g2_review_count
        22. g2_average_rating
        23. company_id
        24. hq_country
        25. headquarters
        26. largest_headcount_country
        27. last_funding_round_type
        28. valuation_date
        29. linkedin_categories
        30. linkedin_industries
        31. crunchbase_investors
        32. crunchbase_categories
        33. acquisition_status
        34. company_year_founded
        35. technology_domains
        36. founder_names_and_profile_urls
        37. founders_location
        38. ceo_location
        39. founders_education_institute
        40. founders_degree_name
        41. founders_previous_company
        42. founders_previous_title
        43. monthly_visitor_mom_pct
        44. monthly_visitor_qoq_pct
        45. traffic_source_social_pct
        46. traffic_source_search_pct
        47. traffic_source_direct_pct
        48. traffic_source_paid_referral_pct
        49. traffic_source_referral_pct
        50. meta_total_ads
        51. meta_active_ads
        52. meta_ad_platforms
        53. meta_ad_url
        54. meta_ad_id
        55. average_organic_rank
        56. monthly_paid_clicks
        57. monthly_organic_clicks
        58. average_ad_rank
        59. total_organic_results
        60. monthly_google_ads_budget
        61. monthly_organic_value
        62. total_ads_purchased
        63. lost_ranks
        64. gained_ranks
        65. newly_ranked
        66. paid_competitors
        67. organic_competitors
        68. linkedin_followers
        69. linkedin_headcount_engineering
        70. linkedin_headcount_sales
        71. linkedin_headcount_operations
        72. linkedin_headcount_human_resource
        73. linkedin_headcount_india
        74. linkedin_headcount_usa
        75. linkedin_headcount_engineering_percent
        76. linkedin_headcount_sales_percent
        77. linkedin_headcount_operations_percent
        78. linkedin_headcount_human_resource_percent
        79. linkedin_headcount_india_percent
        80. linkedin_headcount_usa_percent
        81. linkedin_followers_mom_percent
        82. linkedin_followers_qoq_percent
        83. linkedin_followers_yoy_percent
        84. linkedin_all_employee_skill_names
        85. linkedin_all_employee_skill_count
        86. linkedin_employee_skills_0_to_10_pct
        87. linkedin_employee_skills_11_to_30_pct
        88. linkedin_employee_skills_31_to_50_pct
        89. linkedin_employee_skills_51_to_70_pct
        90. linkedin_employee_skills_71_to_100_pct
        91. glassdoor_culture_rating
        92. glassdoor_diversity_rating
        93. glassdoor_work_life_balance_rating
        94. glassdoor_senior_management_rating
        95. glassdoor_compensation_rating
        96. glassdoor_career_opportunities_rating
        97. glassdoor_recommend_to_friend_pct
        98. glassdoor_ceo_approval_mom_pct
        99. glassdoor_ceo_approval_qoq_pct
        100. glassdoor_ceo_approval_mom_pct.1
        101. glassdoor_review_count_mom_pct
        102. glassdoor_review_count_qoq_pct
        103. glassdoor_review_count_yoy_pct
        104. g2_review_count_mom_pct
        105. g2_review_count_qoq_pct
        106. g2_review_count_yoy_pct
        107. instagram_followers (deprecated)
        108. instagram_posts (deprecated)
        109. instagram_followers_mom_pct (deprecated)
        110. instagram_followers_qoq_pct (deprecated)
        111. instagram_followers_yoy_pct (deprecated)
        112. recent_job_openings_title
        113. recent_job_openings_title_count
        114. job_openings_count
        115. job_openings_count_mom_pct
        116. job_openings_count_qoq_pct
        117. job_openings_count_yoy_pct
        118. job_openings_accounting_qoq_pct
        119. job_openings_accounting_six_months_growth_pct
        120. job_openings_art_and_design_qoq_pct
        121. job_openings_art_and_design_six_months_growth_pct
        122. job_openings_business_development_qoq_pct
        123. job_openings_business_development_six_months_growth_pct
        124. job_openings_engineering_qoq_pct
        125. job_openings_engineering_six_months_growth_pct
        126. job_openings_finance_qoq_pct
        127. job_openings_finance_six_months_growth_pct
        128. job_openings_human_resource_qoq_pct
        129. job_openings_human_resource_six_months_growth_pct
        130. job_openings_information_technology_qoq_pct
        131. job_openings_information_technology_six_months_growth_pct
        132. job_openings_marketing_qoq_pct
        133. job_openings_marketing_six_months_growth_pct
        134. job_openings_media_and_communication_qoq_pct
        135. job_openings_media_and_communication_six_months_growth_pct
        136. job_openings_operations_qoq_pct
        137. job_openings_operations_six_months_growth_pct
        138. job_openings_research_qoq