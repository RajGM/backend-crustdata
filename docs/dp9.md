## Search: LinkedIn People Search API (real-time)

**Overview**: Search for people profiles based on either a direct LinkedIn Sales Navigator search URL or a custom search criteria as a filter. This endpoint allows you to retrieve detailed information about individuals matching specific criteria.

Each request returns upto 25 results. To paginate, update the page number of the Sales Navigator search URL and do the request again.

In the request payload, either set the url of the Sales Navigator Leads search from your browser in the parameter `linkedin_sales_navigator_search_url` or specify the search criteria as a JSON object in the parameter `filters`

Required: authentication token `auth_token` for authorization.

### **Making Requests**

- **Request**:
    
    ### **Request Body:**
    
    The request body can have the following keys (atleast one of them is required)
    
    - `linkedin_sales_navigator_search_url` (optional): URL of the Sales Navigator Leads search from the browser
    - `filters` (optional): JSON dictionary defining the search criteria as laid out by the [Crustdata filter schema](https://www.notion.so/Crustdata-Discovery-And-Enrichment-API-c66d5236e8ea40df8af114f6d447ab48?pvs=21).
    - `page` (optional): Page number for pagination (used only with `filters`)
    - `preview` (optional): Boolean field to get the preview of profiles. When using `preview` don’t use `page`.
    
    ### Examples
    
    - **Via LinkedIn Sales Navigator URL:**
        
        ```
        curl --location 'https://api.crustdata.com/screener/person/search' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Accept-Language: en-US,en;q=0.9' \
        --header 'Authorization: Token $auth_token' \
        --data '{
            "linkedin_sales_navigator_search_url": "https://www.linkedin.com/sales/search/people?query=(recentSearchParam%3A(id%3A3940840412%2CdoLogHistory%3Atrue)%2Cfilters%3AList((type%3ACOMPANY_HEADCOUNT%2Cvalues%3AList((id%3AC%2Ctext%3A11-50%2CselectionType%3AINCLUDED)%2C(id%3AB%2Ctext%3A1-10%2CselectionType%3AINCLUDED)%2C(id%3AD%2Ctext%3A51-200%2CselectionType%3AINCLUDED)%2C(id%3AE%2Ctext%3A201-500%2CselectionType%3AINCLUDED)%2C(id%3AF%2Ctext%3A501-1000%2CselectionType%3AINCLUDED)))%2C(type%3AINDUSTRY%2Cvalues%3AList((id%3A41%2Ctext%3ABanking%2CselectionType%3AINCLUDED)%2C(id%3A43%2Ctext%3AFinancial%20Services%2CselectionType%3AINCLUDED)))%2C(type%3ACOMPANY_HEADQUARTERS%2Cvalues%3AList((id%3A105912732%2Ctext%3ABelize%2CselectionType%3AINCLUDED)%2C(id%3A101739942%2Ctext%3ACosta%20Rica%2CselectionType%3AINCLUDED)%2C(id%3A106522560%2Ctext%3AEl%20Salvador%2CselectionType%3AINCLUDED)%2C(id%3A100877388%2Ctext%3AGuatemala%2CselectionType%3AINCLUDED)%2C(id%3A101937718%2Ctext%3AHonduras%2CselectionType%3AINCLUDED)%2C(id%3A105517145%2Ctext%3ANicaragua%2CselectionType%3AINCLUDED)%2C(id%3A100808673%2Ctext%3APanama%2CselectionType%3AINCLUDED)%2C(id%3A100270819%2Ctext%3AAntigua%20and%20Barbuda%2CselectionType%3AINCLUDED)%2C(id%3A106662619%2Ctext%3AThe%20Bahamas%2CselectionType%3AINCLUDED)%2C(id%3A102118611%2Ctext%3ABarbados%2CselectionType%3AINCLUDED)%2C(id%3A106429766%2Ctext%3ACuba%2CselectionType%3AINCLUDED)%2C(id%3A105057336%2Ctext%3ADominican%20Republic%2CselectionType%3AINCLUDED)%2C(id%3A100720695%2Ctext%3ADominica%2CselectionType%3AINCLUDED)%2C(id%3A104579260%2Ctext%3AGrenada%2CselectionType%3AINCLUDED)%2C(id%3A100993490%2Ctext%3AHaiti%2CselectionType%3AINCLUDED)%2C(id%3A105126983%2Ctext%3AJamaica%2CselectionType%3AINCLUDED)%2C(id%3A102098694%2Ctext%3ASaint%20Kitts%20and%20Nevis%2CselectionType%3AINCLUDED)%2C(id%3A104022923%2Ctext%3ASaint%20Lucia%2CselectionType%3AINCLUDED)%2C(id%3A104703990%2Ctext%3ASaint%20Vincent%20and%20the%20Grenadines%2CselectionType%3AINCLUDED)%2C(id%3A106947126%2Ctext%3ATrinidad%20and%20Tobago%2CselectionType%3AINCLUDED)%2C(id%3A107592510%2Ctext%3ABelize%20City%2C%20Belize%2C%20Belize%2CselectionType%3AINCLUDED)))%2C(type%3ASENIORITY_LEVEL%2Cvalues%3AList((id%3A110%2Ctext%3AEntry%20Level%2CselectionType%3AEXCLUDED)%2C(id%3A100%2Ctext%3AIn%20Training%2CselectionType%3AEXCLUDED)%2C(id%3A200%2Ctext%3AEntry%20Level%20Manager%2CselectionType%3AEXCLUDED)%2C(id%3A130%2Ctext%3AStrategic%2CselectionType%3AEXCLUDED)%2C(id%3A300%2Ctext%3AVice%20President%2CselectionType%3AINCLUDED)%2C(id%3A220%2Ctext%3ADirector%2CselectionType%3AINCLUDED)%2C(id%3A320%2Ctext%3AOwner%20%2F%20Partner%2CselectionType%3AINCLUDED)%2C(id%3A310%2Ctext%3ACXO%2CselectionType%3AINCLUDED)))))&sessionId=UQyc2xY6ROisdd%2F%2B%2BsxmJA%3D%3D"
        }'
        ```
        
    
    **Via Custom Search Filters:**
    
    Refer [Building the Company/People Search Criteria Filter](https://www.notion.so/Building-the-Company-People-Search-Criteria-Filter-116e4a7d95b180528ce4f6c485a76c40?pvs=21) to build the custom search filter for your query and pass it in the `filters` key. Each element of `filters` is a JSON object which defines a filter on a specific field. All the elements of `filters` are joined with a logical “AND” operation when doing the search.
    
    Example:
    
    This query retrieves people working at `Google` or `Microsoft`, excluding those with the titles `Software Engineer` or `Data Scientist`, based in companies headquartered in `United States` or `Canada`, from the `Software Development` or `Hospitals and Health Care` industries, while excluding people located in `California, United States` or `New York, United States`
    
    ```bash
    curl --location 'https://api.crustdata.com/screener/person/search' \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json, text/plain, */*' \
    --header 'Accept-Language: en-US,en;q=0.9' \
    --header 'Authorization: Token $token' \
    --data '{
        "filters": [
            {
                "filter_type": "CURRENT_COMPANY",
                "type": "in",
                "value": ["Google", "Microsoft"]
            },
            {
                "filter_type": "CURRENT_TITLE",
                "type": "not in",
                "value": ["Software Engineer", "Data Scientist"]
            },
            {
                "filter_type": "COMPANY_HEADQUARTERS",
                "type": "in",
                "value": ["United States", "Canada"]
            },
            {
                "filter_type": "INDUSTRY",
                "type": "in",
                "value": ["Software Development", "Hospitals and Health Care"]
            },
            {
                "filter_type": "REGION",
                "type": "not in",
                "value": ["California, United States", "New York, United States"]
            }
        ],
        "page": 1
    }'
    ```
    
    More Examples
    
    - **1.  People with specific first name from a specific company given company’s domain**
        
        ```bash
        curl --location 'https://api.crustdata.com/screener/person/search' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Accept-Language: en-US,en;q=0.9' \
        --header 'Authorization: Token $token' \
        --data '{
          "filters": [
            {
              "filter_type": "FIRST_NAME",
              "type": "in",
              "value": ["steve"]
            },
            {
              "filter_type": "CURRENT_COMPANY",
              "type": "in",
              "value": ["buzzbold.com"]
            }
          ],
        "page": 1
        }'
        ```
        
    - **2.  People with specific first name from a specific company given company’s linkedin url**
        
        ```bash
        curl --location 'https://api.crustdata.com/screener/person/search' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Accept-Language: en-US,en;q=0.9' \
        --header 'Authorization: Token $token' \
        --data '{
          "filters": [
            {
              "filter_type": "FIRST_NAME",
              "type": "in",
              "value": ["Ali"]
            },
            {
              "filter_type": "CURRENT_COMPANY",
              "type": "in",
              "value": ["https://www.linkedin.com/company/serverobotics"]
            }
          ],
        "page": 1
        }'
        ```
        
    - **3.  Preview list of people given filter criteria**
        
        ```bash
        curl --location 'https://api.crustdata.com/screener/person/search' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Authorization: Token $token' \
        --data '{"filters":[
            {
              "filter_type": "CURRENT_COMPANY",
              "type": "in",
              "value": ["serverobotics.com"]
            },
            {
              "filter_type": "REGION",
              "type": "in",
              "value": ["United States"]
            }
          ],
          "preview": true
        }'
        ```
        
    - **4.  People that recently changed jobs and are currently working at a specific company**
        
        ```bash
        curl --location 'https://api.crustdata.com/screener/person/search' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Authorization: Token $token' \
        --data '{"filters":[
            {
              "filter_type": "CURRENT_COMPANY",
              "type": "in",
              "value": ["serverobotics.com"]
            },
            {
              "filter_type": "RECENTLY_CHANGED_JOBS"
            }
          ]
        }'
        ```
        
- **Response**:
    - Default (without `preview=True`): https://jsonhero.io/j/t2CJ3nG7Xymv
    - With `preview=True` : https://jsonhero.io/j/yDSFQui0BKx8
- **Response with preview**
    
    https://jsonhero.io/j/V2VkhY4KrHSF
    

**Key points:**

- **Credits:** Each successful page request costs 25 credits. With `preview` , a successful request costs 5 credits.
- **Pagination:** If the total number of results for the query is more than 25 (value of `total_display_count` param), you can paginate the response in the following ways (depending on your request)
    - When passing `linkedin_sales_navigator_search_url` :
        - adding `page` query param to `linkedin_sales_navigator_search_url` . For example, to get data on `nth` page, `linkedin_sales_navigator_search_url` would become `https://www.linkedin.com/sales/search/people?page=n&query=...` .
        - Example request with `page=2`
            
            ```bash
            curl --location 'https://api.crustdata.com/screener/person/search' \
            --header 'Content-Type: application/json' \
            --header 'Accept: application/json, text/plain, */*' \
            --header 'Accept-Language: en-US,en;q=0.9' \
            --header 'Authorization: Token $auth_token' \
            --data '{
                "linkedin_sales_navigator_search_url": "https://www.linkedin.com/sales/search/people?page=2&query=(recentSearchParam%3A(id%3A3940840412%2CdoLogHistory%3Atrue)%2Cfilters%3AList((type%3ACOMPANY_HEADCOUNT%2Cvalues%3AList((id%3AC%2Ctext%3A11-50%2CselectionType%3AINCLUDED)%2C(id%3AB%2Ctext%3A1-10%2CselectionType%3AINCLUDED)%2C(id%3AD%2Ctext%3A51-200%2CselectionType%3AINCLUDED)%2C(id%3AE%2Ctext%3A201-500%2CselectionType%3AINCLUDED)%2C(id%3AF%2Ctext%3A501-1000%2CselectionType%3AINCLUDED)))%2C(type%3AINDUSTRY%2Cvalues%3AList((id%3A41%2Ctext%3ABanking%2CselectionType%3AINCLUDED)%2C(id%3A43%2Ctext%3AFinancial%20Services%2CselectionType%3AINCLUDED)))%2C(type%3ACOMPANY_HEADQUARTERS%2Cvalues%3AList((id%3A105912732%2Ctext%3ABelize%2CselectionType%3AINCLUDED)%2C(id%3A101739942%2Ctext%3ACosta%20Rica%2CselectionType%3AINCLUDED)%2C(id%3A106522560%2Ctext%3AEl%20Salvador%2CselectionType%3AINCLUDED)%2C(id%3A100877388%2Ctext%3AGuatemala%2CselectionType%3AINCLUDED)%2C(id%3A101937718%2Ctext%3AHonduras%2CselectionType%3AINCLUDED)%2C(id%3A105517145%2Ctext%3ANicaragua%2CselectionType%3AINCLUDED)%2C(id%3A100808673%2Ctext%3APanama%2CselectionType%3AINCLUDED)%2C(id%3A100270819%2Ctext%3AAntigua%20and%20Barbuda%2CselectionType%3AINCLUDED)%2C(id%3A106662619%2Ctext%3AThe%20Bahamas%2CselectionType%3AINCLUDED)%2C(id%3A102118611%2Ctext%3ABarbados%2CselectionType%3AINCLUDED)%2C(id%3A106429766%2Ctext%3ACuba%2CselectionType%3AINCLUDED)%2C(id%3A105057336%2Ctext%3ADominican%20Republic%2CselectionType%3AINCLUDED)%2C(id%3A100720695%2Ctext%3ADominica%2CselectionType%3AINCLUDED)%2C(id%3A104579260%2Ctext%3AGrenada%2CselectionType%3AINCLUDED)%2C(id%3A100993490%2Ctext%3AHaiti%2CselectionType%3AINCLUDED)%2C(id%3A105126983%2Ctext%3AJamaica%2CselectionType%3AINCLUDED)%2C(id%3A102098694%2Ctext%3ASaint%20Kitts%20and%20Nevis%2CselectionType%3AINCLUDED)%2C(id%3A104022923%2Ctext%3ASaint%20Lucia%2CselectionType%3AINCLUDED)%2C(id%3A104703990%2Ctext%3ASaint%20Vincent%20and%20the%20Grenadines%2CselectionType%3AINCLUDED)%2C(id%3A106947126%2Ctext%3ATrinidad%20and%20Tobago%2CselectionType%3AINCLUDED)%2C(id%3A107592510%2Ctext%3ABelize%20City%2C%20Belize%2C%20Belize%2CselectionType%3AINCLUDED)))%2C(type%3ASENIORITY_LEVEL%2Cvalues%3AList((id%3A110%2Ctext%3AEntry%20Level%2CselectionType%3AEXCLUDED)%2C(id%3A100%2Ctext%3AIn%20Training%2CselectionType%3AEXCLUDED)%2C(id%3A200%2Ctext%3AEntry%20Level%20Manager%2CselectionType%3AEXCLUDED)%2C(id%3A130%2Ctext%3AStrategic%2CselectionType%3AEXCLUDED)%2C(id%3A300%2Ctext%3AVice%20President%2CselectionType%3AINCLUDED)%2C(id%3A220%2Ctext%3ADirector%2CselectionType%3AINCLUDED)%2C(id%3A320%2Ctext%3AOwner%20%2F%20Partner%2CselectionType%3AINCLUDED)%2C(id%3A310%2Ctext%3ACXO%2CselectionType%3AINCLUDED)))))&sessionId=UQyc2xY6ROisdd%2F%2B%2BsxmJA%3D%3D"
            }'
            ```
            
    - When passing `filters` :
        - provide `page` as one of the keys in the payload itself
        - Example request with `page=1`
            
            ```bash
            curl --location 'https://api.crustdata.com/screener/person/search' \
            --header 'Content-Type: application/json' \
            --header 'Accept: application/json, text/plain, */*' \
            --header 'Accept-Language: en-US,en;q=0.9' \
            --header 'Authorization: Token $token' \
            --data '{
                "filters": [
                    {
                        "filter_type": "CURRENT_COMPANY",
                        "type": "in",
                        "value": ["Google", "Microsoft"]
                    },
                    {
                        "filter_type": "CURRENT_TITLE",
                        "type": "not in",
                        "value": ["Software Engineer", "Data Scientist"]
                    },
                    {
                        "filter_type": "COMPANY_HEADQUARTERS",
                        "type": "in",
                        "value": ["United States", "Canada"]
                    },
                    {
                        "filter_type": "INDUSTRY",
                        "type": "in",
                        "value": ["Software Development", "Hospitals and Health Care"]
                    },
                    {
                        "filter_type": "REGION",
                        "type": "not in",
                        "value": ["California, United States", "New York, United States"]
                    }
                ],
                "page": 1
            }'
            ```
            

Each page returns upto 25 results. To fetch all the results from a query, you should keep on iterating over pages until you cover the value of `total_display_count` in the response from first page.

- **Latency:** The data is fetched in real-time from Linkedin and the latency for this endpoint is between 10 to 30 seconds.
- **Response schema:** Because the data is fetched realtime, and the results may not be in Crustdata’s database already, the response schema will be different from [person enrichment endpoint](https://www.notion.so/116e4a7d95b180bc9dd0d9acac03ddd4?pvs=21) `screener/people/enrich` . But all the results will be added to Crustdata’s database in 10 min of your query and the data for a specific person profile can be enriched via [person enrichment endpoint](https://www.notion.so/116e4a7d95b180bc9dd0d9acac03ddd4?pvs=21)