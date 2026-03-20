"""
SpectaSnap — Blender GLB Template Generator
=============================================

This script generates a standardised parametric glasses model as a GLB file,
ready for use in SpectaSnap's AR try-on pipeline.

Usage:
  1. Open Blender (3.6+ recommended).
  2. Switch to the Scripting workspace (top tab bar).
  3. Open or paste this script.
  4. Adjust the Parameters section below.
  5. Press Alt+P (or click "Run Script") to execute.
  6. The GLB file is exported to OUTPUT_PATH automatically.

Naming convention (required by SpectaSnap's threeScene.ts):
  - frame_front    — parent Empty at origin; all other objects are children
  - frame_left     — left rim geometry
  - frame_right    — right rim geometry
  - lens_left      — left lens (flat transparent disc / plane)
  - lens_right     — right lens
  - bridge         — nose bridge connecting left and right rims
  - temple_left    — left temple arm (extends backward toward the ear)
  - temple_right   — right temple arm

Orientation:
  - Bridge center sits at world origin (0, 0, 0).
  - The front of the glasses faces -Z (toward the viewer / camera).
  - Y axis points up.
  - Total front width should be ~0.13-0.14 m (Three.js units = metres).

Temple method:
  When models.json has "templeMethod": "split", SpectaSnap detects meshes
  named temple_left / temple_right and animates them independently using
  face landmark positions.  If temples are baked into the frame mesh, use
  "templeMethod": "attached" instead — SpectaSnap will skip temple IK.
"""

import bpy
import math

# ============================================================================
# === Parameters =============================================================
# ============================================================================
# Adjust these values to change the glasses shape before running the script.

LENS_WIDTH = 0.065       # Width of each lens (metres / Three.js units)
LENS_HEIGHT = 0.046      # Height of each lens
BRIDGE_WIDTH = 0.018     # Distance between the two lenses (nose bridge gap)
TEMPLE_LENGTH = 0.11     # Length of each temple arm
RIM_THICKNESS = 0.007    # Thickness of the frame rim tube
FRAME_STYLE = 'round'    # 'round' | 'rectangle' | 'aviator'
OUTPUT_PATH = '//aviator-featured.glb'  # '//' = relative to .blend file dir

# Material colours (approximate; can be overridden by SpectaSnap at runtime)
FRAME_COLOR = (0.12, 0.12, 0.12, 1.0)   # Near-black matte
LENS_COLOR = (0.3, 0.3, 0.3, 0.35)      # Semi-transparent grey

# ============================================================================
# === Helpers ================================================================
# ============================================================================


def clear_scene():
    """Remove all default objects so we start from a clean slate."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    # Also purge orphan data
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)


def create_material(name, color, alpha=1.0):
    """Create a simple Principled BSDF material."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        if alpha < 1.0:
            mat.blend_method = 'BLEND' if hasattr(mat, 'blend_method') else 'OPAQUE'
            bsdf.inputs['Alpha'].default_value = alpha
    return mat


def create_round_rim(name, location, radius_x, radius_y, tube_radius):
    """Create a torus-like rim for round lenses."""
    bpy.ops.mesh.primitive_torus_add(
        major_radius=(radius_x + radius_y) / 2,
        minor_radius=tube_radius,
        major_segments=48,
        minor_segments=12,
        location=location,
    )
    obj = bpy.context.active_object
    obj.name = name
    # Scale to match lens proportions (elliptical if width != height)
    scale_x = radius_x / ((radius_x + radius_y) / 2)
    scale_y = radius_y / ((radius_x + radius_y) / 2)
    obj.scale = (scale_x, scale_y, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    return obj


def create_rect_rim(name, location, width, height, tube_radius):
    """Create a rectangular rim by extruding a profile along a rectangle path."""
    # Use a cube scaled to a thin rectangular frame as a simple proxy
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (width / 2, height / 2, tube_radius)
    bpy.ops.object.transform_apply(scale=True)

    # Add a solidify modifier to hollow it out into a frame shape
    solidify = obj.modifiers.new(name='Solidify', type='SOLIDIFY')
    solidify.thickness = -tube_radius * 2
    solidify.offset = 0
    bpy.ops.object.modifier_apply(modifier='Solidify')
    return obj


def create_lens(name, location, radius_x, radius_y):
    """Create a flat disc representing a lens."""
    bpy.ops.mesh.primitive_circle_add(
        vertices=48,
        radius=1.0,
        fill_type='NGON',
        location=location,
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (radius_x, radius_y, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    return obj


def create_bridge(location, width, thickness):
    """Create the nose bridge as a cylinder stretched horizontally."""
    bpy.ops.mesh.primitive_cylinder_add(
        radius=thickness / 2,
        depth=width,
        location=location,
    )
    obj = bpy.context.active_object
    obj.name = 'bridge'
    # Rotate so the cylinder lies along the X axis
    obj.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(rotation=True)
    return obj


def create_temple(name, start_location, length, thickness):
    """
    Create a temple arm as a thin cylinder extending in the +Z direction
    (backward, away from the face).
    """
    # Temple starts at the outer edge of the rim and extends backward (+Z)
    loc = (
        start_location[0],
        start_location[1],
        start_location[2] + length / 2,
    )
    bpy.ops.mesh.primitive_cylinder_add(
        radius=thickness / 2,
        depth=length,
        location=loc,
    )
    obj = bpy.context.active_object
    obj.name = name
    # Rotate so the cylinder extends along the Z axis (backward)
    obj.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)

    # Add a slight downward curve at the ear hook end
    # (simple approximation: tilt the far end down slightly)
    # For a production model, use a bezier curve or armature instead.
    return obj


# ============================================================================
# === Main ===================================================================
# ============================================================================

def main():
    clear_scene()

    # Calculate positions
    half_bridge = BRIDGE_WIDTH / 2
    lens_center_x = half_bridge + LENS_WIDTH / 2
    rim_radius_x = LENS_WIDTH / 2
    rim_radius_y = LENS_HEIGHT / 2
    temple_start_x = half_bridge + LENS_WIDTH  # outer edge of lens

    # ---- Create materials ----
    frame_mat = create_material('FrameMaterial', FRAME_COLOR)
    lens_mat = create_material('LensMaterial', LENS_COLOR, alpha=LENS_COLOR[3])

    # ---- Create parent empty (frame_front) ----
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    frame_front = bpy.context.active_object
    frame_front.name = 'frame_front'

    # ---- Create rims ----
    if FRAME_STYLE == 'round' or FRAME_STYLE == 'aviator':
        frame_left = create_round_rim(
            'frame_left',
            (-lens_center_x, 0, 0),
            rim_radius_x, rim_radius_y, RIM_THICKNESS,
        )
        frame_right = create_round_rim(
            'frame_right',
            (lens_center_x, 0, 0),
            rim_radius_x, rim_radius_y, RIM_THICKNESS,
        )
    elif FRAME_STYLE == 'rectangle':
        frame_left = create_rect_rim(
            'frame_left',
            (-lens_center_x, 0, 0),
            LENS_WIDTH, LENS_HEIGHT, RIM_THICKNESS,
        )
        frame_right = create_rect_rim(
            'frame_right',
            (lens_center_x, 0, 0),
            LENS_WIDTH, LENS_HEIGHT, RIM_THICKNESS,
        )
    else:
        raise ValueError(f"Unknown FRAME_STYLE: {FRAME_STYLE}. Use 'round', 'rectangle', or 'aviator'.")

    # Assign frame material
    for obj in (frame_left, frame_right):
        if obj.data.materials:
            obj.data.materials[0] = frame_mat
        else:
            obj.data.materials.append(frame_mat)

    # ---- Create lenses ----
    lens_left = create_lens('lens_left', (-lens_center_x, 0, 0), rim_radius_x * 0.92, rim_radius_y * 0.92)
    lens_right = create_lens('lens_right', (lens_center_x, 0, 0), rim_radius_x * 0.92, rim_radius_y * 0.92)

    for obj in (lens_left, lens_right):
        if obj.data.materials:
            obj.data.materials[0] = lens_mat
        else:
            obj.data.materials.append(lens_mat)

    # ---- Create bridge ----
    bridge = create_bridge((0, 0, 0), BRIDGE_WIDTH, RIM_THICKNESS)
    if bridge.data.materials:
        bridge.data.materials[0] = frame_mat
    else:
        bridge.data.materials.append(frame_mat)

    # ---- Create temple arms ----
    temple_left = create_temple(
        'temple_left',
        (-temple_start_x, 0, 0),
        TEMPLE_LENGTH,
        RIM_THICKNESS * 0.8,
    )
    temple_right = create_temple(
        'temple_right',
        (temple_start_x, 0, 0),
        TEMPLE_LENGTH,
        RIM_THICKNESS * 0.8,
    )

    for obj in (temple_left, temple_right):
        if obj.data.materials:
            obj.data.materials[0] = frame_mat
        else:
            obj.data.materials.append(frame_mat)

    # ---- Parent all objects to frame_front ----
    all_parts = [frame_left, frame_right, lens_left, lens_right, bridge, temple_left, temple_right]
    for obj in all_parts:
        obj.parent = frame_front

    # ---- Select all for export ----
    bpy.ops.object.select_all(action='SELECT')

    # ---- Export as GLB ----
    output = bpy.path.abspath(OUTPUT_PATH)
    bpy.ops.export_scene.gltf(
        filepath=output,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
    )
    print(f"\n[SpectaSnap] GLB exported successfully to: {output}\n")


# Run the script
if __name__ == '__main__':
    main()
