# Test Preferred States Functionality

## Updated cURL Command with Preferred States

Here's the updated cURL command that includes preferred state IDs:

```bash
curl 'http://localhost:7700/api/web/careers/job_application' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryMoeeqlMhEciANUke' \
  -H 'Origin: http://localhost:3000' \
  -H 'Pragma: no-cache' \
  -H 'Referer: http://localhost:3000/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: same-site' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  --data-raw $'------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[name]"\r\n\r\nVaishnav\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[email]"\r\n\r\nvaishnavtdy@gmail.com\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[phone]"\r\n\r\n8222094421\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[preferred_locations][]"\r\n\r\n194\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[preferred_states][]"\r\n\r\n1\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[preferred_states][]"\r\n\r\n2\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[current_location]"\r\n\r\nKozhikode\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[referred_employee_name]"\r\n\r\nskdnjcd\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[employee_referral_code]"\r\n\r\nnjc\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[age]"\r\n\r\n27\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[notice_period]"\r\n\r\n60 to 90 days\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[current_salary]"\r\n\r\n50000\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[expected_salary]"\r\n\r\n800000\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="recaptcha"\r\n\r\n0cAFcWeA5iQOWkB2OawwPWqBAz-NfWw1DQ440k8UBg-VE2PJCHcI8j_okmVCdZrBroiBRzqjJ-VD7e7XQIsQyO4t8O7ZU1RwD6nZRVDDW0jm2mnJxD5E67BJCyrksUTpOC5oL8HUREzUMSL4T5j44rcdxTvIic4350wc6weH4WrKS1_CuBwIIM7NQLDmGMRPflJ6Bsx_CaEmqeU58D1cnTKjTs_Vznyc6RnI2XCOauv-kdfi4uyl-8mulPooJ3TZSlnGY6fnqHuEsjyszRAOXwnf-IVWBJKYX0Hd8KU1wyBg290vQC2cMHXX2QkmWaP7oHq5mCo5oq0Nm5VI-WIJrNGmVGtUsZUeVtE9jNpfm2hMEsP0fP1YGyEEtnYK1kOJDqhOb-6y4jSTbhHH0jPEmwJnUcJQV96vD3vahFxc4MaYIdJxlgGh66XlOEsougB_kNALGhq0I3TbKUZNo50rNvBHSOTYuaE7uvS1tWN9F5f5rKoOiJqox0EIL9gVw-cXh0-GVhpMyvANPC3l15HqBdkn7TEE39td0aDLnIoU-8Xt_0hMVdNbGVECWrae5u3GmcEJGhDg2dN030AUmmHRiLqebl1D7nrZLt2Un3IoF_8liTmsMDgQ-uXdYxNtyMw803McGmZdO2DtWuiWjTB-qng6LrDdQozmti4_bJSVRyc9664di_pj1OEH37YRaSfXua48Ouf7eHlqpzLRXYGwTOrWgthRgM4M2FNqM-Mv3dXHlNLsejuNKnhC8R_QZGAgjodjxJQQ0Nw_S9aopvIxZs7FClARW8qMVhCn-PsnBxwbSslUYHDdGdRWEWK5o-DDcMmHJbmM_UdKMJrjyFuFGLYN8H8LqCibGmlUR9JUG7V-b0d_BdjL45jgV6joe_Nr9XSoE1IZU91253hSf68vgsIJXPCjWNs6PoyrFMxGlc2V0DZk4smtHkU-zFf7DYHAuh-IVZDvuVUZ4o-LFpoclw9a8JoTNiQJAnKZ-EdH9W6xel6dlLyfTS_DQZAGQsTVCKmfdtIEicaJSBYN_iX4bAqa3aGZ0zfQKvZIVH2OotYrR0j-ZhH0T6Qgl6ugbsUSZ-FG8FiYTv-D-vdSMzgqtxeZgM-NpF27HV9nJwspj8gOoIBtExzv-unUhHf-KC7wsyqy3C1-e2upCv9KYXMBO0Q9qAaluFNuVJ-1t-aMTWbhkHowRBhSpugwIi05u8zkScQ54u83N1PpWrI4xwoWtcHI5h4kB2zWBzpq51zusAXNdSXnTQxlIhCwe4oHeM3cKjF9hxlyjmYDIohSNSIqKzO6hoMfSGFgUa4YmVFepHAJ28YZ1kUvQPZw2-DHaKT3t7d-MSqZBgNN-w8i83erEEJGhzNmk904_S_YbtcWLFOMgdX6iiyyGs37xZyZ6nr8V4tUjw5bI438TPEvYBMwyAkE4ngXIiF6YfKT0VMFRUM0X7PqhoyAMnZdiTchD_CbmRhqu87K5IieT_DtiusAIFPL0MGpn2cQBNSsEzWw0iqf0KxQL-IeH9CBqUNy26Qkfa7vrC40zIQvgs2_mGLGgauS8eITvNwrLjheZh0c153_jRtSr998nzOMLXIPMcR3H3Js-SGfDju6WF3cPet6d2tNKq0ROwFKyDDU4dtadutZYraHoijw1vfsA\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="applicant[is_active]"\r\n\r\ntrue\r\n------WebKitFormBoundaryMoeeqlMhEciANUke\r\nContent-Disposition: form-data; name="job_application[job_id]"\r\n\r\n6\r\n------WebKitFormBoundaryMoeeqlMhEciANUke--\r\n'
```

## Key Changes Made

1. **Added `applicant[preferred_states][]` fields** - You can add multiple state IDs by repeating this field
2. **State IDs 1 and 2** - These are example state IDs (you should use actual state IDs from your database)
3. **Backward compatibility** - The existing `preferred_locations` functionality remains unchanged

## Database Changes Required

You'll need to run a migration to create the `applicant_states` table:

```sql
CREATE TABLE applicant_states (
  id SERIAL PRIMARY KEY,
  applicant_id INTEGER NOT NULL REFERENCES applicants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE ON UPDATE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(applicant_id, state_id)
);
```

## API Response

The API response will now include preferred states in the applicant data:

```json
{
  "success": true,
  "data": {
    "applicant": {
      "id": 123,
      "name": "Vaishnav",
      "email": "vaishnavtdy@gmail.com",
      "preferredLocations": [
        {
          "id": 194,
          "location_name": "Kozhikode",
          "ApplicantLocations": {
            "is_primary": true
          }
        }
      ],
      "preferredStates": [
        {
          "id": 1,
          "state_name": "Kerala",
          "ApplicantStates": {
            "is_primary": true
          }
        },
        {
          "id": 2,
          "state_name": "Tamil Nadu",
          "ApplicantStates": {
            "is_primary": false
          }
        }
      ]
    },
    "job_application": {
      "id": 456,
      "job_id": 6,
      "applicant_id": 123
    }
  },
  "message": "Job application submitted successfully"
}
```

## Notes

- Preferred states are optional - if not provided, the application will work as before
- The first state in the array will be marked as primary (`is_primary: true`)
- State IDs must exist in the `states` table
- The system validates that all provided state IDs exist before creating the application
