# Company Endpoints

## Search: LinkedIn Company Search API (real-time)

**Overview**: Search for company profiles using either directly a LinkedIn Sales Navigator accounts search URL or a custom search criteria as a filter. This endpoint allows you to retrieve detailed information about companies matching specific criteria.

Each request returns up-to 25 results. To paginate, update the page number of the Sales Navigator search URL and do the request again.

In the request payload, either set the url of the Sales Navigator Accounts search from your browser in the parameter `linkedin_sales_navigator_search_url` or specify the search criteria as a JSON object in the parameter `filters`

Required: authentication token `auth_token` for authorization.

### Building the Company/People Search Criteria Filter

Based on the field on you are filtering, filters can be categorized into 3 different categories

- **Text Filter**
    
    A **text filter** is used to filter based on specific text values. Each **text filter** must contain **filter_type**, **type** and list of **value**.
    
    **Example:**
    
    ```
    {
      "filter_type": "COMPANY_HEADCOUNT",
      "type": "in",
      "value": ["10,001+", "1,001-5,000"]
    }
    ```
    
    **Valid** `type`**:**
    
    - `in`: To include values.
    - `not in`: To exclude values. Excluding values might not be supported for every filter.
- **Range Filter**
    
    A **range filter** is used to filter based on a range of values. Each filter must contain **filter_type**, **type** and **value**. Few range filters might contain a **sub_filter**. Ensure that you correctly pass **sub_filter** if required.
    
    **sub_filter**
    
    The **sub_filter** is an optional field that provides additional context for the range filter. For example, with the `DEPARTMENT_HEADCOUNT` filter, the **sub_filter** specifies which department the filter applies to. Ensure that you correctly pass **sub_filter** if required.
    
    **Example:**
    
    ```
    {
      "filter_type": "ANNUAL_REVENUE",
      "type": "between",
      "value": {"min": 1, "max": 500},
      "sub_filter": "USD"
    }
    ```
    
    **Valid** `type`**:**
    
    - `between`: To specify a range of values, indicating that the value must fall within the defined minimum and maximum limits.
- **Boolean Filter**
    
    A **boolean filter** is used to filter based on true/false values. It doesn't contain any **type** or **value**
    
    **Example:**
    
    ```
    {
      "filter_type": "IN_THE_NEWS"
    }
    ```
    

And here is the full dictionary for filter attributes and possible values you can pass:

- **Filter Dictionary for Company Search**
    
    
    | Filter Type | Description | Properties | Value/Sub-filter |
    | --- | --- | --- | --- |
    | `COMPANY_HEADCOUNT` | Specifies the size of the company based on the number of employees. | `types: [in]` | `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"` |
    | `REGION` | Specifies the geographical region of the company. | `types: [in, not in]` | [region_values](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/updated_regions.json) |
    | `INDUSTRY` | Specifies the industry of the company. | `types: [in, not in]` | [industry_values](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json) |
    | `NUM_OF_FOLLOWERS` | Specifies the number of followers a company has. | `types: [in]` | `"1-50"`, `"51-100"`, `"101-1000"`, `"1001-5000"`, `"5001+"` |
    | `FORTUNE` | Specifies the Fortune ranking of the company. | `types: [in]` | `"Fortune 50"`, `"Fortune 51-100"`, `"Fortune 101-250"`, `"Fortune 251-500"` |
    | `ACCOUNT_ACTIVITIES` | Specifies recent account activities, such as leadership changes or funding events. | `types: [in]` | `"Senior leadership changes in last 3 months"`, `"Funding events in past 12 months"` |
    | `JOB_OPPORTUNITIES` | Specifies job opportunities available at the company. | `types: [in]` | `"Hiring on Linkedin”` |
    | `COMPANY_HEADCOUNT_GROWTH` | Specifies the growth of the company's headcount. | `allowed_without_sub_filter`, `types: [between]` | N/A |
    | `ANNUAL_REVENUE` | Specifies the annual revenue of the company. | `types: [between]` | `"USD"`, `"AED"`, `"AUD"`, `"BRL"`, `"CAD"`, `"CNY"`, `"DKK"`, `"EUR"`, `"GBP"`, `"HKD"`, `"IDR"`, `"ILS"`, `"INR"`, `"JPY"`, `"NOK"`, `"NZD"`, `"RUB"`, `"SEK"`, `"SGD"`, `"THB"`, `"TRY"`, `"TWD"` |
    | `DEPARTMENT_HEADCOUNT` | Specifies the headcount of specific departments within the company. | `types: [between]` | `"Accounting"`, `"Administrative"`, `"Arts and Design"`, `"Business Development"`, `"Community and Social Services"`, `"Consulting"`, `"Education"`, `"Engineering"`, `"Entrepreneurship"`, `"Finance"`, `"Healthcare Services"`, `"Human Resources"`, `"Information Technology"`, `"Legal"`, `"Marketing"`, `"Media and Communication"`, `"Military and Protective Services"`, `"Operations"`, `"Product Management"`, `"Program and Project Management"`, `"Purchasing"`, `"Quality Assurance"`, `"Real Estate"`, `"Research"`, `"Sales"`, `"Customer Success and Support"` |
    | `DEPARTMENT_HEADCOUNT_GROWTH` | Specifies the growth of headcount in specific departments. | `types: [between]` | `"Accounting"`, `"Administrative"`, `"Arts and Design"`, `"Business Development"`, `"Community and Social Services"`, `"Consulting"`, `"Education"`, `"Engineering"`, `"Entrepreneurship"`, `"Finance"`, `"Healthcare Services"`, `"Human Resources"`, `"Information Technology"`, `"Legal"`, `"Marketing"`, `"Media and Communication"`, `"Military and Protective Services"`, `"Operations"`, `"Product Management"`, `"Program and Project Management"`, `"Purchasing"`, `"Quality Assurance"`, `"Real Estate"`, `"Research"`, `"Sales"`, `"Customer Success and Support"` |
    | `KEYWORD` | Filters based on specific keywords related to the company. | `types: [in]` | List of strings (max length 1)
    
    Supports boolean filters.
    
    Example: `"'sales' or 'marketing' or 'gtm'"`  will match either of these 3 words across the full LinkedIn profile of the company |
- **Filter Dictionary for Person Search**
    
    
    | Filter Type | Description | Properties | Value/Sub-filter |
    | --- | --- | --- | --- |
    | `CURRENT_COMPANY` | Specifies the current company of the person.  | `types: [in, not in]` | List of strings.
    
    You can specify names, domains or LinkedIn url of the companies. Example:
    
    `”Serve Robotics”`, `“serverobotics.com”`, `“https://www.linkedin.com/company/serverobotics”` |
    | `CURRENT_TITLE` | Specifies the current title of the person. | `types: [in, not in]` | List of strings. Case in-sensitive contains matching for each of the strings.
    
    Example: `["ceo", "founder", "director"]` will match all the profiles with any current job title(s) having any of the 3 strings (”ceo” or “founder” or “director”)  |
    | `PAST_TITLE` | Specifies the past titles held by the person. | `types: [in, not in]` | List of strings. Case in-sensitive contains matching for each of the strings.
    
    Example: `["ceo", "founder", "director"]` will match all the profiles with any past job title(s) having any of the 3 strings (”ceo” or “founder” or “director”)  |
    | `COMPANY_HEADQUARTERS` | Specifies the headquarters of the person's company. | `types: [in, not in]` | [region_values](https://jsonhero.io/j/mjVQGjJEJr8i) |
    | `COMPANY_HEADCOUNT` | Specifies the size of the company based on the number of employees. | `types: [in]` | `"Self-employed"`, `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"` |
    | `REGION` | Specifies the geographical region of the person. | `types: [in, not in]` | [region_values](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/updated_regions.json) |
    | `INDUSTRY` | Specifies the industry of the person's company. | `types: [in, not in]` | [industry_values](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json) |
    | `PROFILE_LANGUAGE` | Specifies the language of the person's profile. | `types: [in]` | `"Arabic"`, `"English"`, `"Spanish"`, `"Portuguese"`, `"Chinese"`, `"French"`, `"Italian"`, `"Russian"`, `"German"`, `"Dutch"`, `"Turkish"`, `"Tagalog"`, `"Polish"`, `"Korean"`, `"Japanese"`, `"Malay"`, `"Norwegian"`, `"Danish"`, `"Romanian"`, `"Swedish"`, `"Bahasa Indonesia"`, `"Czech"` |
    | `SENIORITY_LEVEL` | Specifies the seniority level of the person. | `types: [in, not in]` | `"Owner / Partner"`, `"CXO"`, `"Vice President"`, `"Director"`, `"Experienced Manager"`, `"Entry Level Manager"`, `"Strategic"`, `"Senior"`, `"Entry Level"`, `"In Training"`  |
    | `YEARS_AT_CURRENT_COMPANY` | Specifies the number of years the person has been at their current company. | `types: [in]` | `"Less than 1 year"`, `"1 to 2 years"`, `"3 to 5 years"`, `"6 to 10 years"`, `"More than 10 years"` |
    | `YEARS_IN_CURRENT_POSITION` | Specifies the number of years the person has been in their current position. | `types: [in]` | `"Less than 1 year"`, `"1 to 2 years"`, `"3 to 5 years"`, `"6 to 10 years"`, `"More than 10 years"` |
    | `YEARS_OF_EXPERIENCE` | Specifies the total years of experience the person has. | `types: [in]` | `"Less than 1 year"`, `"1 to 2 years"`, `"3 to 5 years"`, `"6 to 10 years"`, `"More than 10 years"` |
    | `FIRST_NAME` | Specifies the first name of the person. | `types: [in]` | List of strings (max length 1) |
    | `LAST_NAME` | Specifies the last name of the person. | `types: [in]` | List of strings (max length 1) |
    | `FUNCTION` | Specifies the function or role of the person. | `types: [in, not in]` | `"Accounting"`, `"Administrative"`, `"Arts and Design"`, `"Business Development"`, `"Community and Social Services"`, `"Consulting"`, `"Education"`, `"Engineering"`, `"Entrepreneurship"`, `"Finance"`, `"Healthcare Services"`, `"Human Resources"`, `"Information Technology"`, `"Legal"`, `"Marketing"`, `"Media and Communication"`, `"Military and Protective Services"`, `"Operations"`, `"Product Management"`, `"Program and Project Management"`, `"Purchasing"`, `"Quality Assurance"`, `"Real Estate"`, `"Research"`, `"Sales"`, `"Customer Success and Support"` |
    | `PAST_COMPANY` | Specifies the past companies the person has worked for. | `types: [in, not in]` | List of strings
    
    You can specify names, domains or LinkedIn url of the companies. Example:
    
    `”Serve Robotics”`, `“serverobotics.com”`, `“https://www.linkedin.com/company/serverobotics”` |
    | `COMPANY_TYPE` | Specifies the type of company the person works for. | `types: [in]` | `"Public Company"`, `"Privately Held"`, `"Non Profit"`, `"Educational Institution"`, `"Partnership"`, `"Self Employed"`, `"Self Owned"`, `"Government Agency"` |
    | `POSTED_ON_LINKEDIN` | Specifies if the person has posted on LinkedIn. | N/A | N/A |
    | `RECENTLY_CHANGED_JOBS` | Specifies if the person has recently changed jobs. | N/A | N/A |
    | `IN_THE_NEWS` | Specifies if the person has been mentioned in the news. | N/A | N/A |
    | `KEYWORD` | Filters based on specific keywords related to the company. | `types: [in]` | List of strings (max length 1)
    
    Supports boolean filters.
    
    Example: `"'sales' or 'gtm' or 'marketer'"`  will match either of these 3 words across the full LinkedIn profile of the person |

### **Making Requests**

- **Request**:
    
    ### **Request Body:**
    
    The request body can have the following keys (atleast one of them is required)
    
    - `linkedin_sales_navigator_search_url` (optional): URL of the Sales Navigator Accounts search from the browser
    - `filters` (optional): JSON dictionary defining the search criteria as laid out by the [Crustdata filter schema](https://www.notion.so/Crustdata-Discovery-And-Enrichment-API-c66d5236e8ea40df8af114f6d447ab48?pvs=21).
    - `page` (optiona): Only valid when `filters` is not empty. When passing `linkedin_sales_navigator_search_url`, page should be specified in `linkedin_sales_navigator_search_url` itself
    
    ### Examples
    
    - **Via LinkedIn Sales Navigator URL:**
        
        ```bash
        curl --location 'https://api.crustdata.com/screener/company/search' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Accept-Language: en-US,en;q=0.9' \
        --header 'Authorization: Token $auth_token' \
        --data '{
            "linkedin_sales_navigator_search_url": "https://www.linkedin.com/sales/search/company?query=(filters%3AList((type%3ACOMPANY_HEADCOUNT%2Cvalues%3AList((id%3AD%2Ctext%3A51-200%2CselectionType%3AINCLUDED)))%2C(type%3AREGION%2Cvalues%3AList((id%3A103323778%2Ctext%3AMexico%2CselectionType%3AINCLUDED)))%2C(type%3AINDUSTRY%2Cvalues%3AList((id%3A25%2Ctext%3AManufacturing%2CselectionType%3AINCLUDED)))))&sessionId=8TR8HMz%2BTVOYaeivK9p%2Bpg%3D%3D&viewAllFilters=true"
        }'
        ```
        
    
    **Via Custom Search Filters:**
    
    Refer [Building the Company/People Search Criteria Filter](https://www.notion.so/Building-the-Company-People-Search-Criteria-Filter-116e4a7d95b180528ce4f6c485a76c40?pvs=21) to build the custom search filter for your query and pass it in the `filters` key. Each element of `filters` is a JSON object which defines a filter on a specific field. All the elements of `filters` are joined with a logical “AND” operation when doing the search.
    
    Example:
    
    This query retrieves people from companies with a headcount between `1,001-5,000` or more than `10,001+`, with annual revenue between `1` and `500 million USD`, excluding those located in the `United States`, and returns the second page of results.
    
    ```bash
    curl --location 'https://api.crustdata.com/screener/company/search' \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json, text/plain, */*' \
    --header 'Accept-Language: en-US,en;q=0.9' \
    --header 'Authorization: Token $token' \
    --data '{
        "filters": [
            {
                "filter_type": "COMPANY_HEADCOUNT",
                "type": "in",
                "value": ["10,001+", "1,001-5,000"]
            },
            {
                "filter_type": "ANNUAL_REVENUE",
                "type": "between",
                "value": {"min": 1, "max": 500},
                "sub_filter": "USD"
            },
            {
                "filter_type": "REGION",
                "type": "not in",
                "value": ["United States"]
            }
        ],
        "page": 2
    }'
    ```
    
- **Response**:
    
    https://jsonhero.io/j/zn02zfopXQas
    
- **Key points:**
    - **Credits:** Each page request costs 25 credits
    - **Pagination:** If the total number of results for the query is more than 25 (value of `total_display_count` param), you can paginate the response in the following ways (depending on your request)
        - When passing `linkedin_sales_navigator_search_url` :
            - adding `page` query param to `linkedin_sales_navigator_search_url` . For example, to get data on `n` th page, `linkedin_sales_navigator_search_url` would become `https://www.linkedin.com/sales/search/company?page=n&query=...` .
                - Example request with `page=2`
                    
                    ```bash
                    curl --location 'https://api.crustdata.com/screener/person/search' \
                    --header 'Content-Type: application/json' \
                    --header 'Accept: application/json, text/plain, */*' \
                    --header 'Accept-Language: en-US,en;q=0.9' \
                    --header 'Authorization: Token $auth_token' \
                    --data '{
                        "linkedin_sales_navigator_search_url": "https://www.linkedin.com/sales/search/company?page=2&query=(filters%3AList((type%3ACOMPANY_HEADCOUNT%2Cvalues%3AList((id%3AD%2Ctext%3A51-200%2CselectionType%3AINCLUDED)))%2C(type%3AINDUSTRY%2Cvalues%3AList((id%3A25%2Ctext%3AManufacturing%2CselectionType%3AINCLUDED)))))&sessionId=8TR8HMz%2BTVOYaeivK9p%2Bpg%3D%3D"
                    }'
                    ```
                    
        - When passing `filters` :
            - provide `page` as one of the keys in the payload itsefl
                - Example request with `page=2`
                    
                    ```bash
                    curl --location 'https://api.crustdata.com/screener/company/search' \
                    --header 'Content-Type: application/json' \
                    --header 'Accept: application/json, text/plain, */*' \
                    --header 'Accept-Language: en-US,en;q=0.9' \
                    --header 'Authorization: Token $token' \
                    --data '{
                        "filters": [
                            {
                                "filter_type": "COMPANY_HEADCOUNT",
                                "type": "in",
                                "value": ["10,001+", "1,001-5,000"]
                            },
                            {
                                "filter_type": "ANNUAL_REVENUE",
                                "type": "between",
                                "value": {"min": 1, "max": 500},
                                "sub_filter": "USD"
                            },
                            {
                                "filter_type": "REGION",
                                "type": "not in",
                                "value": ["United States"]
                            }
                        ],
                        "page": 2
                    }'
                    ```
                    
        
        Each page returns upto 25 results. To fetch all the results from a query, you should keep on iterating over pages until you cover the value of `total_display_count` in the response from first page.
        
    - **Latency:** The data is fetched in real-time from Linkedin and the latency for this endpoint is between 10 to 30 seconds.
    - **Response schema:** Because the data is fetched realtime, and the results may not be in Crustdata’s database already, the response schema will be different from c[ompany data enrichment endpoint](https://www.notion.so/116e4a7d95b180bc9dd0d9acac03ddd4?pvs=21) `screener/company` . But all the results will be added to Crustdata’s database in 60 min of your query and the data for a specific company profile can be enriched via [company enrichment endpoint](https://www.notion.so/116e4a7d95b180bc9dd0d9acac03ddd4?pvs=21)