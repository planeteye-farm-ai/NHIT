export interface BridgeInspection {
    bridge_id: string,
    duration_of_inspection: string;
    erosion_of_embankment: string;
    approach_slab: string;
    approach_geometry: string;
    accumulation_on_approaches: string;
    erosion_of_embankment_image: File;
    approach_slab_image:File,
    approach_geometry_image:File;
    accumulation_on_approaches_image:File;

}

export interface BridgeInspectionUpdate {
    bridge_id: string,
    // highwayNo: string,
    // typeOfBridge: string,
    // traffic_intensity: string;
    // pavement_surface_condition: string;
    // side_slopes: string;
    erosion_of_embankment: string;
    approach_slab: string;
    approach_geometry: string;
    accumulation_on_approaches: string;
    protective_work_type: string;
    protective_layout_damage: string;
    protective_slope_condition: string;
    floor_protection_condition: string;
    abnormal_scour: string;
    reserve_stone_material: string;
    waterway_obstruction: string;
    flow_pattern_change: string;
    max_flood_level: string;
    abnormal_afflux: string;
    waterway_adequacy: string;
    foundation_settlement: string;
    foundation_cracks: string;
    foundation_damage: string;
    subway_damage: string;
    substructure_drainage_efficiency: string;
    substructure_cracks: string;
    subway_wall_condition: string;
    road_excavation: string;
    pier_abutment_damage: string;
    protective_coating_condition: string;
    metallic_bearing_type: string;
    metallic_bearing_condition: string;
    metallic_bearing_functioning: string;
    metallic_bearing_greasing: string;
    anchor_bolts_condition: string;
    elastomeric_bearings: string;
    elastomeric_bearings_condition: string;
    genral_cleanliness: string;
    concrete_bearings: string;
    signs_of_distress: string;
    excessive_tilting: string;
    loss_of_shape: string;
    // concrete_genral_cleanliness: string;
    support_member_cracks: string;
    superstructure_type: string;
    spalling_condition: string;
    deck_cracks: string;
    deck_cover_thickness: string;
    deck_surface_wear: string;
    deck_scaling: string;
    deck_surface_stains: string;
    deck_leaching: string;
    reinforcement_corrosion: string;
    deck_leakage: string;
    vehicle_damage: string;
    articulation_cracks: string;
    deck_vibration: string;
    deck_deflection: string;
    end_anchorage_cracks: string;
    cantilever_deflection: string;
    longitudinal_cracks_in_flanges: string;
    spalling_or_cracking_of_concrete: string;
    shear_cracks: string;
    box_girder_cracks: string;
    accumulation_for_submersible_bridges: string;
    protective_coating_peeling: string;
    steel_members: string;
    protective_system_condition: string;
    corrosion_if_any: string;
    excessive_vibrations: string;
    alignment_of_members: string;
    condition_of_connection: string;
    excessive_loss_of_camber: string;
    buckling_kinking_warping_waviness: string;
    cleanliness_of_members: string;
    fracture_apparent: string;
    excessive_wear: string;
    closed_members_conditions: string;
    masonry_arches: string;
    condition_of_joints_mortar: string;
    flattening_by_observing_rise: string;
    masonry_arches_cracks: string;
    drainage_of_spandrel_fillings: string;
    growth_of_vegetation: string;
    cast_iron_and_wrought_iron: string;
    casting_of_metal: string;
    expansion_joint_functioning: string;
    expansion_joint_sealing_condition: string;
    expansion_joint_security: string;
    expansion_joint_top_plate_condition: string;
    expansion_joint_locking: string;
    expansion_joint_debris: string;
    expansion_joint_rattling: string;
    expansion_joint_drainage: string;
    wearing_coat_condition: string;
    wearing_coat_wear: string;
    wearing_coat_thickness: string;
    drainage_spouts_condition: string;
    spout_projection: string;
    adequacy_thereof: string;
    drainage_adequacy: string;
    submersible_bridges_functioning: string;
    handrail_condition: string;
    handrail_collision: string;
    handrail_alignment: string;
    footpath_condition: string;
    footpath_slabs: string;
    utility_leakage: string;
    utility_damage: string;
    lighting_condition: string;
    utility_other_damages: string;
    condition_of_painting: string;
    aesthetics_condition: string;
    duration_of_inspection: string;
    // method_of_inspection: string;
    suggestions: Suggestion[];
    remarks: string;
    // vertical_clear_of_struct: string;
    // rat_of_avg_daily_traffic:string;
}

export interface Suggestion {
    items_needing_attentions: string;
    actions_recommended: string;
    suggestion_time: string;
    remarks: string;
}