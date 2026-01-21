"""
Get the list of relevant TUM modules from the official API and store them in a fitting format in ../data_cache.

See https://api.srv.nat.tum.de/docs#/ for API documentation.
"""

import json
import os

import requests
import tqdm


BASE_API_URL = "https://api.srv.nat.tum.de/api"


def get_cache_filepath(filename: str) -> str:
    """
    Make sure files are stored in backend/data_cache/ even if run from backend/data_cache/scripts or elsewhere.
    ALso makes sure data_cache/ exists.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_cache_dir = os.path.abspath(os.path.join(base_dir, "..", "data_cache"))
    os.makedirs(data_cache_dir, exist_ok=True)
    return os.path.join(data_cache_dir, filename)


def get_cit_modules():
    """
    Gets all modules for TUM School of Computation, Information and Technology
    replicates: curl -X 'GET' 'https://api.srv.nat.tum.de/api/mhb/module?semester_key=lecture&level_tags=level_bachelor&org_id=51897&has_courses=false&order_by=code&limit=50&offset=0&columns=module_code&columns=module_title&columns=module_responsible&columns=module_credits&columns=module_languages&columns=module_cycle&columns=module_levels&columns=catalog_tag&link_target=local_url' -H 'accept: application/json'
    returned response has attributes: total_count, count, offset, next_offset, previous_offset, hits, catalogs, columns, and link_target
    """

    def query_modules(semester_key, level_tags, org_id, limit, offset):
        url = f"{BASE_API_URL}/mhb/module"
        params = {
            "semester_key": semester_key,
            "level_tags": level_tags,
            "org_id": org_id,
            "has_courses": "false",
            "order_by": "code",
            "limit": limit,
            "offset": offset,
            "columns": [
                "module_code",
                "module_title",
                "module_credits",
                "module_cycle",
                "module_levels",
                "catalog_tag",
            ],
            "link_target": link_target,
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()

    semester_key = "lecture"
    level_tags = ["level_bachelor"]
    org_id = 51897  # CIT
    limit = 200
    offset = 0
    link_target = "tumonline_url"

    # keep querying until no more results
    all_modules = []
    while True:
        result = query_modules(semester_key, level_tags, org_id, limit, offset)
        all_modules.extend(result["hits"])
        if result["next_offset"] is None:
            break
        offset = result["next_offset"]
    
    # return only relevant fields: module_id, module_code, module_title, module_title_en, module_credits, description_id, description_version
    simplified_modules = []
    for module in all_modules:
        simplified_modules.append({
            "module_id": module["module_id"],
            "module_code": module["module_code"],
            "module_title": module["module_title"],
            "module_title_en": module.get("module_title_en"),
            "module_credits": module["module_credits"],
            "description_id": module["description_id"],
            "description_version": module["description_version"],
        })
    
    return simplified_modules


def get_module_content(module_code: int, description_version: int) -> str:
    """
    Get the module content and outcome text for a given module.
    """
    url = f"{BASE_API_URL}/mhb/module/{module_code}/{description_version}"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    relevant_data = {}
    relevant_data["module_content"] = data.get("module_content", "")
    relevant_data["module_content_en"] = data.get("module_content_en", "")
    relevant_data["module_outcome"] = data.get("module_outcome", "")
    relevant_data["module_outcome_en"] = data.get("module_outcome_en", "")
    return relevant_data


if __name__ == "__main__":
    print("Fetching TUM CIT modules from API...")
    modules = get_cit_modules()
    print(f"Fetched {len(modules)} modules from TUM API")
    print("Fetching module contents...")
    num_fail = 0
    # progress bar for modules
    for module in (pbar := tqdm.tqdm(modules)):
        pbar.set_postfix_str(f"Module {module['module_code']}")
        content = get_module_content(module["module_code"], module["description_version"])
        if not content:
            num_fail += 1
        module.update(content)
    if num_fail > 0:
        print(f"Warning: Failed to fetch content for {num_fail} modules")
    print("Saving modules to data_cache/tum_cit_modules.json...")
    cache_path = get_cache_filepath("tum_cit_modules.json")
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(modules, f, ensure_ascii=False, indent=4)
    print(f"Saved {len(modules)} modules to data_cache/tum_cit_modules.json")
