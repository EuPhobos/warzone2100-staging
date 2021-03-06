include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const COLLECTIVE_RES = [
	"R-Defense-WallUpgrade05", "R-Struc-Materials06",
	"R-Struc-Factory-Upgrade06", "R-Struc-Factory-Cyborg-Upgrade06",
	"R-Struc-VTOLFactory-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Engine05", "R-Vehicle-Metals05", "R-Cyborg-Metals06",
	"R-Vehicle-Armor-Heat02", "R-Cyborg-Armor-Heat02",
	"R-Sys-Engineering02", "R-Wpn-Cannon-Accuracy02", "R-Wpn-Cannon-Damage05",
	"R-Wpn-Cannon-ROF03", "R-Wpn-Flamer-Damage06", "R-Wpn-Flamer-ROF03",
	"R-Wpn-MG-Damage07", "R-Wpn-MG-ROF03", "R-Wpn-Mortar-Acc02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF03",
	"R-Wpn-Rocket-Accuracy02", "R-Wpn-Rocket-Damage06",
	"R-Wpn-Rocket-ROF03", "R-Wpn-RocketSlow-Accuracy03",
	"R-Wpn-RocketSlow-Damage06", "R-Sys-Sensor-Upgrade01",
	"R-Wpn-Howitzer-Accuracy02", "R-Wpn-RocketSlow-ROF03",
	"R-Wpn-Howitzer-Damage03",
];

function vtolPatrol()
{
	camManageGroup(camMakeGroup("COVtolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("vtolPos1"),
			camMakePos("vtolPos2"),
			camMakePos("vtolPos3"),
			camMakePos("vtolPos4"),
			camMakePos("vtolPos5"),
		],
		//fallback: camMakePos("cyborgAssembly-b1"),
		//morale: 10,
		interval: 20000,
		regroup: false,
	});

}

function cyborgPatrol()
{
	camManageGroup(camMakeGroup("NWTankGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("NWTankPos1"),
			camMakePos("NWTankPos2"),
			camMakePos("NWTankPos3"),
		],
		//fallback: camMakePos("cyborgAssembly-b1"),
		//morale: 50,
		interval: 45000,
		regroup: false,
	});

	camManageGroup(camMakeGroup("WCyborgGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("WCybPos1"),
			camMakePos("WCybPos2"),
			camMakePos("WCybPos3"),
		],
		//fallback: camMakePos("heavyAssembly-b2"),
		//morale: 90,
		interval: 30000,
		regroup: false,
	});
}

function enableFactories()
{
	camEnableFactory("COCyborgFac-b1");
	camEnableFactory("COHeavyFacL-b2");
	camEnableFactory("COHeavyFacR-b2");
	camEnableFactory("COVtolFac-b3");
}

function enableReinforcements()
{
	playSound("pcv440.ogg"); // Reinforcements are available.
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "CAM_2END", {
		area: "RTLZ",
		reinforcements: 180, //3 min
		annihilate: true
	});
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "CAM_2END", {
		area: "RTLZ",
		reinforcements: -1,
		annihilate: true
	});

	var startpos = getObject("startPosition");
	var lz = getObject("landingZone"); //player lz
	var tent = getObject("transporterEntry");
	var text = getObject("transporterExit");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	camSetArtifacts({
		"COVtolFac-b3": { tech: "R-Vehicle-Body09" }, //Tiger body
		"COHeavyFacL-b2": { tech: "R-Wpn-HvyHowitzer" },
	});

	setPower(AI_POWER, THE_COLLECTIVE); //10000.
	camCompleteRequiredResearch(COLLECTIVE_RES, THE_COLLECTIVE);

	camSetEnemyBases({
		"COBase1": {
			cleanup: "COBase1Cleanup",
			detectMsg: "C28_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"COBase2": {
			cleanup: "COBase2Cleanup",
			detectMsg: "C28_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"COBase3": {
			cleanup: "COBase3Cleanup",
			detectMsg: "C28_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	with (camTemplates) camSetFactories({
		"COCyborgFac-b1": {
			assembly: camMakePos("cyborgAssembly-b1"),
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(40000),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [cocybag, npcybr, npcybf, npcybc]
		},
		"COHeavyFacL-b2": {
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(80000),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [comhpv, cohact]
		},
		"COHeavyFacR-b2": {
			assembly: camMakePos("heavyAssembly-b2"),
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(80000),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [comrotmh, cohct]
		},
		"COVtolFac-b3": {
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(90000),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [comhvat]
		},
	});

	queue("enableReinforcements", 15000);
	queue("cyborgPatrol", 50000);
	queue("vtolPatrol", 60000);
	queue("enableFactories", camChangeOnDiff(480000)); // 8 min
}
