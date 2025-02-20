# Company Endpoints

# People Endpoints

## **Enrichment: People Profile(s) API**

**Overview:** Enrich data for one or more individuals using LinkedIn profile URLs or business email addresses. This API allows you to retrieve enriched person data from Crustdata’s database or perform a real-time search from the web if the data is not available.

**Key Features:**

- Enrich data using **LinkedIn profile URLs** or **business email addresses** (3 credit per profile/email)
- Option to perform a **real-time search** if data is not present in the database (5 credit per profile/email)
- Retrieve data for up to **25 profiles or emails** in a single request.

Required: authentication token `auth_token` for authorization.

- **Request:**
    
    **Query Parameters**
    
    - ***linkedin_profile_url*** (optional): Comma-separated list of LinkedIn profile URLs.
        - **Example:** `linkedin_profile_url=https://www.linkedin.com/in/johndoe/,https://www.linkedin.com/in/janedoe/`
            
            ```python
            curl 'https://api.crustdata.com/screener/person/enrich?linkedin_profile_url=https://www.linkedin.com/in/dtpow/,https://www.linkedin.com/in/janedoe/' \
              --header 'Accept: application/json, text/plain, */*' \
              --header 'Accept-Language: en-US,en;q=0.9' \
              --header 'Authorization: Token $auth_token'
            ```
            
    - ***business_email*** (optional): Person business email address.
        - **Note**:- You can only provide one business email address per request
        - **Example:** `business_email=john.doe@example.com`
            
            ```python
            curl 'https://api.crustdata.com/screener/person/enrich?business_email=john.doe@example.com' \
              --header 'Accept: application/json, text/plain, */*' \
              --header 'Accept-Language: en-US,en;q=0.9' \
              --header 'Authorization: Token $auth_token'
            ```
            
    - ***enrich_realtime*** (optional): Boolean (True or False). If set to True, performs a real-time search from the web if data is not found in the database.
        - **Default:** False
        - **Example:**
            
            ```python
            curl 'https://api.crustdata.com/screener/person/enrich?linkedin_profile_url=https://www.linkedin.com/in/dtpow/,https://www.linkedin.com/in/janedoe/&enrich_realtime=True' \
              --header 'Accept: application/json, text/plain, */*' \
              --header 'Accept-Language: en-US,en;q=0.9' \
              --header 'Authorization: Token $auth_token'
            ```
            
    - **fields** (optional): *string* (comma-separated list of fields). Specifies the fields you want to include in the response.
        - Possible Values
            - linkedin_profile_url: *string*
            - linkedin_flagship_url: *string*
            - name: *string*
            - location: *string*
            - email: *string*
            - title: *string*
            - last_updated: *string*
            - headline: *string*
            - summary: *string*
            - num_of_connections: *string*
            - skills: *array of strings*
            - profile_picture_url: *string*
            - twitter_handle: *string*
            - languages: *array of strings*
            - linkedin_open_to_cards: *array of strings*
            - all_employers: *array of objects*
            - past_employers: *array of objects*
            - current_employers: *array of objects*
            - education_background.degree_name: key with string value in array of objects
            - education_background.end_date: key with string value in array of objects
            - education_background.field_of_study: key with string value in array of objects
            - education_background.institute_linkedin_id: key with string value in array of objects
            - education_background.institute_linkedin_url: key with string value in array of objects
            - education_background.institute_logo_url: key with string value in array of objects
            - education_background.institute_name: key with string value in array of objects
            - education_background.start_date: key with string value in array of objects
            - education_background.activities_and_societies: key with string value in array of objects
            - certifications: *array of objects*
            - honors: *array of objects*
            - all_employers_company_id: *array of integers*
            - all_titles: *array of strings*
            - all_schools: *array of strings*
            - all_degrees: *array of strings*
            - all_connections: *array of strings*
        - **Example:** `fields=all_degrees,education_background`
    
    **Notes:**
    
    - **Mandatory Parameters:** You must provide either `linkedin_profile_url` or `business_email`. Do not include both in the same request.
    - **Formatting:** Multiple URLs or emails should be comma-separated. Extra spaces or tabs before or after commas are ignored.
    - Multiple LinkedIn profile URLs should be separated by commas. Extra spaces or tabs before or after commas will be ignored.
    - **Fields**
        - If you don’t use fields, you will get all the fields in response except `all_connections`, `linkedin_open_to_cards`,`certifications`  , `honors`  & `education_background.activities_and_societies`
        - Access to certain fields may be restricted based on your user permissions. If you request fields you do not have access to, the API will return an error indicating unauthorized access.
        - Top level non-object fields are present in response irrespective of fields.
        - Don’t include metadata fields : `enriched_realtime`, `score` and `query_linkedin_profile_urn_or_slug` in fields
    
    **Examples**
    
    - **1. Request with all fields**:
        - Usecase: Ideal for users who wants to access all fields which are not provided by default
        
        ```bash
        curl -X GET "https://api.crustdata.com/screener/person/enrich?linkedin_profile_url=https://www.linkedin.com/in/sasikumarm00&enrich_realtime=true&fields=linkedin_profile_url,linkedin_flagship_url,name,location,email,title,last_updated,headline,summary,num_of_connections,skills,profile_picture_url,twitter_handle,languages,linkedin_open_to_cards,all_employers,past_employers,current_employers,education_background.degree_name,education_background.end_date,education_background.field_of_study,education_background.institute_linkedin_id,education_background.institute_linkedin_url,education_background.institute_logo_url,education_background.institute_name,education_background.start_date,education_background.activities_and_societies,certifications,honors,all_employers_company_id,all_titles,all_schools,all_degrees,all_connections" \
        -H "Authorization: Token auth_token" \,
        -H "Content-Type: application/json"
        ```
        
    - **2. Request with all default fields AND** `education_background.activities_and_societies`:
        
        ```bash
        curl -X GET "https://api.crustdata.com/screener/person/enrich?linkedin_profile_url=https://www.linkedin.com/in/sasikumarm00&enrich_realtime=true&fields=linkedin_profile_url,linkedin_flagship_url,name,location,email,title,last_updated,headline,summary,num_of_connections,skills,profile_picture_url,twitter_handle,languages,all_employers,past_employers,current_employers,education_background.degree_name,education_background.end_date,education_background.field_of_study,education_background.institute_linkedin_id,education_background.institute_linkedin_url,education_background.institute_logo_url,education_background.institute_name,education_background.start_date,education_background.activities_and_societies,all_employers_company_id,all_titles,all_schools,all_degrees" \
        -H "Authorization: Token auth_token" \
        -H "Content-Type: application/json"
        ```
        
    - **3. Request with all default fields AND** `certifications` , `honors`  and `linkedin_open_to_cards` :
        
        ```bash
        curl -X GET "https://api.crustdata.com/screener/person/enrich?linkedin_profile_url=https://www.linkedin.com/in/sasikumarm00&enrich_realtime=true&fields=linkedin_profile_url,linkedin_flagship_url,name,location,email,title,last_updated,headline,summary,num_of_connections,skills,profile_picture_url,twitter_handle,languages,all_employers,past_employers,current_employers,education_background.degree_name,education_background.end_date,education_background.field_of_study,education_background.institute_linkedin_id,education_background.institute_linkedin_url,education_background.institute_logo_url,education_background.institute_name,education_background.start_date,all_employers_company_id,all_titles,all_schools,all_degrees,linkedin_open_to_cards,certifications,honors" \
        -H "Authorization: Token auth_token" \
        -H "Content-Type: application/json"
        ```
        
    - **4. Request without fields**:
        
        ```bash
        curl -X GET "https://api.crustdata.com/screener/person/enrich?linkedin_profile_url=https://www.linkedin.com/in/sasikumarm00&enrich_realtime=true" \
        -H "Authorization: Token auth_token" \
        -H "Content-Type: application/json"
        ```
        
    - **5. Request with business email:**
        
        ```bash
        curl -X GET "https://api.crustdata.com/screener/person/enrich?business_email=shubham.joshi@coindcx.com&enrich_realtime=true" \
        -H "Authorization: Token auth_token" \
        -H "Content-Type: application/json"
        ```
        
    
- **Response:**
    - When LinkedIn profiles are present in Crustdata’s database:
        - Response will include the enriched data for each profile. [JSON Hero](https://jsonhero.io/j/UEyFru4RDLoI)
    - When one or more LinkedIn profiles are not present in Crustdata’s database:
        - An error message will be returned for each profile not found, along with instructions to query again after 60 minutes. https://jsonhero.io/j/kwdasun8HdqM
    - Response with all possible fields: https://jsonhero.io/j/zenKXWh36HsM
    
    **Notes**
    
    - If some profiles or emails are not found in the database and `enrich_realtime=False`, an empty response for those entries is returned, and they will be auto-enriched in the background. Query again after at least **60 minutes** to retrieve the data.
    - If `enrich_realtime=True` and the profile or email cannot be found even via real-time search, an error message is returned for those entries.
- **Key points:**
    
    **Latency**
    
    - **Database Search:** Less than **10 seconds** per profile.
    - **Real-Time Search:** May take longer due to fetching data from the web.
    
    **Limits**
    
    - **Profiles/Emails per Request:** Up to **25**.
    - **Exceeding Limits:** Requests exceeding this limit will be rejected with an error message.
    
    **Credits**
    
    - **Database Enrichment:**
        - **3 credits** per LinkedIn profile or email.
    - **Real-Time Enrichment (enrich_realtime=True):**
        - **5 credits** per LinkedIn profile or email.
    
    **Constraints**
    
    - **Valid Input:** Ensure all LinkedIn URLs and email addresses are correctly formatted.
        - Invalid inputs result in validation errors.
    - **Mutually Exclusive Parameters:** Do not include both linkedin_profile_url and business_email in the same request.
    - **Independent Processing:** Each profile or email is processed independently.
        - Found entries are returned immediately
        - Not found entries trigger the enrichment process (if enrich_realtime=False)