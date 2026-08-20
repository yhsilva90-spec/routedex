import unittest

from encounter_reconciliation import merge_canonical_details, upsert_canonical_encounter


class EncounterReconciliationTests(unittest.TestCase):
    def test_adds_a_species_missing_from_the_workbook(self):
        encounters = []
        encounter, added = upsert_canonical_encounter(
            encounters,
            location_id="route-210",
            pokemon_id=400,
            canonical_details=[
                {
                    "method": "Walking",
                    "times": ["morning", "day", "night"],
                    "versions": ["BD", "SP"],
                    "chance": "20%",
                    "levels": "24",
                    "source": "https://pokemondb.net/location/sinnoh-route-210",
                }
            ],
        )

        self.assertTrue(added)
        self.assertEqual(encounter["pokemonId"], 400)
        self.assertEqual(encounter["method"], "Walking")
        self.assertEqual(encounter["details"][0]["chance"], "20%")

    def test_keeps_special_and_canonical_methods_on_one_species(self):
        encounter = {
            "id": "route-210-400",
            "pokemonId": 400,
            "locationId": "route-210",
            "method": "Swarm",
            "times": ["unknown"],
            "versions": ["BD", "SP"],
            "details": [
                {"method": "Swarm", "times": ["unknown"], "versions": ["BD", "SP"], "source": "workbook"}
            ],
            "source": "workbook",
        }

        merge_canonical_details(
            encounter,
            [
                {
                    "method": "Walking",
                    "times": ["morning", "day", "night"],
                    "versions": ["BD", "SP"],
                    "source": "https://pokemondb.net/location/sinnoh-route-210",
                }
            ],
        )

        self.assertEqual({detail["method"] for detail in encounter["details"]}, {"Swarm", "Walking"})
        self.assertEqual(encounter["times"], ["unknown", "morning", "day", "night"])

    def test_does_not_duplicate_the_same_source_detail(self):
        encounter = {"pokemonId": 400, "times": [], "versions": [], "details": []}
        detail = {"method": "Walking", "times": ["day"], "versions": ["BD"], "source": "source"}
        merge_canonical_details(encounter, [detail, detail])
        self.assertEqual(len(encounter["details"]), 1)


if __name__ == "__main__":
    unittest.main()
